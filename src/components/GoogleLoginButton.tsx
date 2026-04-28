import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/api";

interface Props {
  onSuccess: (payload: { token: string; user: any }) => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function GoogleLoginButton({ onSuccess, onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      onError("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    if (!window.google?.accounts?.id || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const credential = response.credential;
          if (!credential) throw new Error("Google sign-in failed");

          const apiResponse = await fetch(`${API_BASE}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: credential }),
          });

          const data = await apiResponse.json();
          if (!apiResponse.ok) {
            throw new Error(data.error || "Google login failed");
          }

          onSuccess(data);
        } catch (error: any) {
          onError(error?.message || "Google login failed");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 320,
      text: "signin_with",
    });

    setReady(true);
  }, [onError, onSuccess]);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div ref={buttonRef} />
      {!ready && (
        <button
          type="button"
          disabled
          className="w-full rounded-full border border-border bg-white px-4 py-3 text-sm text-muted-foreground"
        >
          Google sign-in loading…
        </button>
      )}
    </div>
  );
}
