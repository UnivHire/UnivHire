import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuthStore, AuthUser } from "../store/authStore";

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const fakeToken = btoa(`hr:${Date.now()}`);
    const user: AuthUser = { id: `hr_${Date.now()}`, name, email: "hr@invited.com", university };
    document.cookie = `univhire_token=${fakeToken}; path=/`;
    document.cookie = `univhire_role=hr; path=/`;
    setAuth(fakeToken, "hr", user);
    navigate("/hr/dashboard", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center px-4 py-16">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <GraduationCap size={16} />
        <span className="font-bold text-foreground">UnivHire</span>
      </Link>
      <motion.div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
          <span className="text-xs font-semibold text-emerald-700">HR Invite Link — Token: {token?.slice(0, 8)}…</span>
        </div>
        <h1 className="mt-4 mb-1 text-2xl font-bold text-foreground">Activate your HR account</h1>
        <p className="mb-7 text-sm text-muted-foreground">Set up your credentials to manage hiring for your university</p>
        <form onSubmit={handleActivate} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Your full name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40 transition" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">University name</span>
            <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} required className="rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40 transition" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/60">Set password</span>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-full border border-border bg-background px-5 py-3 pr-12 text-sm outline-none focus:border-foreground/40 transition" />
              <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          <button type="submit" disabled={loading} className="mt-1 w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition">
            {loading ? "Activating…" : "Activate HR Account →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}