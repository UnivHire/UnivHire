/**
 * Centralized API base URL — set VITE_API_URL in .env to override.
 * Falls back to localhost:5000 for local development.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

/** Convenience helper for authenticated JSON requests */
export async function apiFetch(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // Only set Content-Type to JSON when not FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
