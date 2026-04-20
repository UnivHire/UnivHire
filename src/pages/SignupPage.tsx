import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Check } from "lucide-react";
import { useAuthStore, AuthUser } from "../store/authStore";

const ROLE_CARDS = [
  { id: "faculty", icon: "🎓", label: "Faculty" },
  { id: "driver", icon: "🚗", label: "Driver" },
  { id: "security", icon: "🛡️", label: "Security Guard" },
  { id: "peon", icon: "📋", label: "Peon" },
  { id: "trainer", icon: "💻", label: "Trainer" },
  { id: "admin_staff", icon: "🏢", label: "Admin Staff" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const CITIES: Record<string, string[]> = {
  "Delhi": ["New Delhi","Noida","Gurgaon","Faridabad"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik"],
  "Karnataka": ["Bangalore","Mysore","Hubli"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai"],
  "Uttar Pradesh": ["Lucknow","Agra","Varanasi","Kanpur"],
  "Rajasthan": ["Jaipur","Jodhpur","Udaipur"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara"],
  "West Bengal": ["Kolkata","Howrah","Durgapur"],
};

const TOTAL_STEPS = 4;

export function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Step 1 */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /* Step 2 */
  const [selectedRole, setSelectedRole] = useState("");
  /* Step 3 */
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const cities = state ? CITIES[state] || [] : [];

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const next = () => {
    setError("");
    if (step === 1) {
      if (!name || !phone || !email || !password) { setError("Please fill in all fields."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    }
    if (step === 2 && !selectedRole) { setError("Please select a role."); return; }
    if (step === 3 && (!state || !city)) { setError("Please select your state and city."); return; }
    setStep((s) => s + 1);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
          role: "CANDIDATE", // They are signing up for jobs
          university: state + " " + city, // storing location info in university temporarily for simplicity or keeping it null. Let's send it as university metadata if needed. Wait, we don't have location on user schema. We can pass university: "Not provided".
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      const { token, user } = data;
      const role = user.role.toLowerCase() as any;

      document.cookie = `univhire_token=${token}; path=/`;
      document.cookie = `univhire_role=${role}; path=/`;
      // For type matching we use the roleType as whatever they selected internally
      setAuth(token, role, { ...user, roleType: selectedRole });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center px-4 py-16">
      <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition">
        <GraduationCap size={16} />
        <span className="font-bold text-foreground">UnivHire</span>
      </Link>

      <motion.div
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Basic info ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h1 className="mb-1 text-2xl font-bold text-foreground">Create your account</h1>
              <p className="mb-6 text-sm text-muted-foreground">Fill in your details to get started</p>
              <div className="grid gap-4">
                <AuthInput label="Full name" value={name} onChange={setName} placeholder="Rahul Kumar" />
                <AuthInput label="Phone number" value={phone} onChange={setPhone} placeholder="+91 9876543210" />
                <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-foreground/60">Password</span>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-full border border-border bg-background px-5 py-3 pr-12 text-sm text-foreground outline-none focus:border-foreground/40 transition"
                    />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Role selection ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h1 className="mb-1 text-2xl font-bold text-foreground">What describes you best?</h1>
              <p className="mb-6 text-sm text-muted-foreground">Choose the role you are seeking</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ROLE_CARDS.map((rc) => {
                  const selected = selectedRole === rc.id;
                  return (
                    <button
                      key={rc.id}
                      type="button"
                      onClick={() => setSelectedRole(rc.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
                        selected ? "border-foreground bg-foreground/5" : "border-border bg-background hover:border-foreground/30"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-white">
                          <Check size={11} />
                        </span>
                      )}
                      <span className="text-2xl leading-none">{rc.icon}</span>
                      <span className="text-xs font-semibold text-foreground">{rc.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Location ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h1 className="mb-1 text-2xl font-bold text-foreground">Where are you based?</h1>
              <p className="mb-6 text-sm text-muted-foreground">We&#39;ll show you nearby opportunities</p>
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-foreground/60">State</span>
                  <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition">
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-foreground/60">City</span>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" disabled={!state}>
                    <option value="">Select city…</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    {state && cities.length === 0 && <option value={state + " City"}>{state} City</option>}
                  </select>
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-foreground">
                <Check size={40} className="text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">You&#39;re all set!</h1>
              <p className="mb-1 text-sm text-muted-foreground">Account created for <strong className="text-foreground">{name}</strong></p>
              <p className="mb-8 text-xs text-muted-foreground">Role: {ROLE_CARDS.find((r) => r.id === selectedRole)?.label} · {city}, {state}</p>
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white transition hover:opacity-80 disabled:opacity-60"
              >
                {loading ? "Setting up your account…" : "Go to Dashboard →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {step < 4 && (
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => { setError(""); setStep((s) => s - 1); }} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background transition">
                ← Back
              </button>
            ) : (
              <div />
            )}
            <button type="button" onClick={next} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-white hover:opacity-80 transition">
              {step === 3 ? "Review →" : "Continue →"}
            </button>
          </div>
        )}

        {step === 1 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">Login</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}

function AuthInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition"
      />
    </label>
  );
}