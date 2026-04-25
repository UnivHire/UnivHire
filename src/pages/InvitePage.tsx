import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore, AuthUser } from "../store/authStore";
import { API_BASE } from "../lib/api";

export function InvitePage() {
  const { token: inviteToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [inviteInfo, setInviteInfo] = useState<{ email: string; role: string } | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");

  // Validate the invite token on mount
  useEffect(() => {
    if (!inviteToken) {
      setInviteError("Missing invite token.");
      setValidating(false);
      return;
    }
    fetch(`${API_BASE}/api/invites/${inviteToken}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid invite");
        setInviteInfo(data);
      })
      .catch((err) => setInviteError(err.message || "Invalid or expired invite link."))
      .finally(() => setValidating(false));
  }, [inviteToken]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/invites/${inviteToken}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, university, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to activate account");

      const user: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        university: data.user.university,
      };
      document.cookie = `univhire_token=${data.token}; path=/`;
      document.cookie = `univhire_role=${data.user.role.toLowerCase()}; path=/`;
      setAuth(data.token, data.user.role.toLowerCase() as any, user);
      navigate("/hr/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to activate account");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#ECEEF0] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center px-4 py-16">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <GraduationCap size={16} />
          <span className="font-bold text-foreground">UnivHire</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Invalid Invite</h1>
          <p className="mt-2 text-sm text-muted-foreground">{inviteError}</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition"
          >
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center px-4 py-16">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <GraduationCap size={16} />
        <span className="font-bold text-foreground">UnivHire</span>
      </Link>
      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
          <span className="text-xs font-semibold text-emerald-700">
            {inviteInfo?.role || "HR"} Invite — {inviteInfo?.email}
          </span>
        </div>
        <h1 className="mt-4 mb-1 text-2xl font-bold text-foreground">Activate your account</h1>
        <p className="mb-7 text-sm text-muted-foreground">
          Set up your credentials to manage hiring for your university
        </p>
        <form onSubmit={handleActivate} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Your full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40 transition"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">University name</span>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
              className="rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40 transition"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Set password</span>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-full border border-border bg-background px-5 py-3 pr-12 text-sm outline-none focus:border-foreground/40 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition"
          >
            {loading ? "Activating…" : "Activate Account →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}