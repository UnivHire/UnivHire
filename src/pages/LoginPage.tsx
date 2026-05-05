import { API_BASE } from "../lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore, UserRole, AuthUser, isHrRole, normalizeRole } from "../store/authStore";
import { GoogleLoginButton } from "../components/GoogleLoginButton";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || null;

  const { token, role, setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !role) return;

    const destination =
      returnUrl ||
      (role === "admin"
        ? "/admin"
        : isHrRole(role)
        ? "/hr/dashboard"
        : "/dashboard");

    navigate(destination, { replace: true });
  }, [navigate, returnUrl, role, token]);

  /* ── Demo quick-login (no backend during development) ── */
  const DEMO_ACCOUNTS: Record<string, { role: UserRole; user: AuthUser }> = {
    "candidate@demo.com": {
      role: "candidate",
      user: { id: "c1", name: "Rahul Kumar", email: "candidate@demo.com", roleType: "Faculty" },
    },
    "hr@demo.com": {
      role: "hr",
      user: { id: "h1", name: "HR Manager", email: "hr@demo.com", university: "Delhi University" },
    },
    "admin@demo.com": {
      role: "admin",
      user: { id: "a1", name: "Admin User", email: "admin@demo.com" },
    },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Successful login
      const { token, user } = data;
      // Normalizing the role format (uppercase from DB -> lowercase for frontend if needed)
      const role = normalizeRole(user.role);
      
      document.cookie = `univhire_token=${token}; path=/`;
      document.cookie = `univhire_role=${role}; path=/`;
      setAuth(token, role, { ...user, roleType: user.role });

      const dest = returnUrl
        ? returnUrl
        : role === "admin"
        ? "/admin"
        : isHrRole(role)
        ? "/hr/dashboard"
        : "/dashboard";

      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center px-4 py-16">
      {/* Back to home */}
      <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition">
        <GraduationCap size={16} />
        <span className="font-bold text-foreground">UnivHire</span>
      </Link>

      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-1 text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mb-7 text-sm text-muted-foreground">Enter your details to continue</p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Email / Phone</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Password</span>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-full border border-border bg-background px-5 py-3 pr-12 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white transition hover:opacity-80 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login →"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleLoginButton
          onSuccess={(data) => {
            const nextRole = normalizeRole(data.user.role);
            setAuth(data.token, nextRole, { ...data.user, roleType: data.user.role });
            const dest = returnUrl
              ? returnUrl
              : nextRole === "admin"
              ? "/admin"
              : isHrRole(nextRole)
              ? "/hr/dashboard"
              : "/dashboard";
            navigate(dest, { replace: true });
          }}
          onError={(message) => setError(message)}
        />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to UnivHire?{" "}
          <Link to="/signup" className="font-semibold text-foreground hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Join 1,200+ candidates and 50+ universities
      </p>

      {/* Demo hint */}
      <div className="mt-4 rounded-xl border border-border bg-white/70 px-5 py-3 text-center text-xs text-muted-foreground max-w-sm">
        <strong className="text-foreground">Demo:</strong>&nbsp;
        <code className="text-secondary">candidate@demo.com</code> or{" "}
        <code className="text-secondary">hr@demo.com</code> — any password (≥ 4 chars)
      </div>
    </div>
  );
}
