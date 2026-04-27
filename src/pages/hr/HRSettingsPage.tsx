import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bell, Shield, User, Trash2, Check, Eye, EyeOff,
  ToggleLeft, ToggleRight, Lock, Mail, AlertTriangle, Palette,
  Building2, Phone, MapPin, Globe, Briefcase, ChevronRight,
  LogOut,
} from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";
import { API_BASE } from "../../lib/api";

type Section =
  | "profile"
  | "notifications"
  | "security"
  | "appearance"
  | "account";

const SIDEBAR_ITEMS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "profile",       label: "Profile",       icon: <User size={16} />,    desc: "Personal & work info" },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} />,    desc: "Alerts & digests" },
  { id: "security",      label: "Security",      icon: <Shield size={16} />,  desc: "Password & login" },
  { id: "appearance",    label: "Appearance",    icon: <Palette size={16} />, desc: "Theme & display" },
  { id: "account",       label: "Account",       icon: <Trash2 size={16} />,  desc: "Danger zone" },
];

export function HRSettingsPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [active, setActive] = useState<Section>("profile");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  /* ── Profile state ─────────────────── */
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    designation: "HR Manager",
    department: "Human Resources",
    university: user?.university || "",
    location: "India",
    website: "",
    bio: "Dedicated HR professional passionate about connecting talented individuals with the right opportunities.",
  });

  // Load profile from backend on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            designation: data.designation || "HR Manager",
            department: data.department || "Human Resources",
            university: data.university || "",
            location: data.location || "India",
            website: data.website || "",
            bio: data.bio || "",
          });
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ── Notification state ─────────────── */
  const [notif, setNotif] = useState({
    newApplication: true,
    statusUpdate: true,
    jobExpiry: true,
    weeklyReport: false,
    emailDigest: true,
    systemUpdates: false,
  });

  /* ── Security state ─────────────────── */
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwErr, setPwErr] = useState("");

  /* ── Appearance state ───────────────── */
  const [theme, setTheme] = useState<"light" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  /* ── Account state ──────────────────── */
  const [deleteEmail, setDeleteEmail] = useState("");

  /* ── Helpers ────────────────────────── */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const saveProfile = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          designation: profile.designation,
          department: profile.department,
          university: profile.university,
          location: profile.location,
          website: profile.website,
          bio: profile.bio,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const fakeSave = async (msg: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    showToast(msg);
  };

  const handlePasswordChange = async () => {
    setPwErr("");
    if (!pw.current) return setPwErr("Enter your current password.");
    if (pw.next.length < 8) return setPwErr("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm) return setPwErr("Passwords do not match.");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Password updated successfully!");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPwErr(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteEmail !== user?.email) return;
    logout();
    navigate("/");
  };

  const initials = (user?.name || "HR")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  /* ── Toggle pill ─────────────────────── */
  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className="shrink-0 transition">
      {value
        ? <ToggleRight size={30} className="text-secondary" />
        : <ToggleLeft size={30} className="text-muted-foreground" />}
    </button>
  );

  /* ── Section content map ─────────────── */
  const renderContent = () => {
    switch (active) {
      /* ───── PROFILE ───── */
      case "profile":
        return (
          <div className="space-y-6">
            <SectionHeader title="Profile" desc="Update your personal and professional details." />

            {/* Avatar row */}
            <div className="flex items-center gap-5 rounded-2xl bg-muted/50 px-6 py-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-white shadow">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile.name || "Your Name"}</p>
                <p className="text-xs text-muted-foreground">{profile.designation} · {profile.university || "University"}</p>
              </div>
            </div>

            {/* Grid of fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <Field label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} type="email" />
              <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="+91 98765 43210" />
              <Field label="Designation" value={profile.designation} onChange={(v) => setProfile({ ...profile, designation: v })} />
              <Field label="Department" value={profile.department} onChange={(v) => setProfile({ ...profile, department: v })} />
              <Field label="University" value={profile.university} onChange={(v) => setProfile({ ...profile, university: v })} />
              <Field label="Location" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} />
              <Field label="Website" value={profile.website} onChange={(v) => setProfile({ ...profile, website: v })} placeholder="https://university.edu" />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground resize-none outline-none focus:border-foreground/40 transition"
                placeholder="Tell candidates about yourself..."
              />
            </div>

            <SaveBtn onClick={saveProfile} saving={saving} />
          </div>
        );

      /* ───── NOTIFICATIONS ───── */
      case "notifications":
        return (
          <div className="space-y-6">
            <SectionHeader title="Notifications" desc="Choose what alerts you receive and how." />

            <div className="rounded-2xl bg-white shadow-sm divide-y divide-border overflow-hidden">
              {[
                { key: "newApplication" as const,  label: "New Application",        desc: "When a candidate applies to one of your jobs", icon: <Briefcase size={15} /> },
                { key: "statusUpdate" as const,    label: "Application Status",     desc: "When you update a candidate's status", icon: <Check size={15} /> },
                { key: "jobExpiry" as const,       label: "Job Expiry Reminder",    desc: "3 days before a listing closes", icon: <Bell size={15} /> },
                { key: "weeklyReport" as const,    label: "Weekly Summary Report",  desc: "Digest of all activity this week", icon: <Mail size={15} /> },
                { key: "emailDigest" as const,     label: "Daily Email Digest",     desc: "New applicants summary every morning", icon: <Mail size={15} /> },
                { key: "systemUpdates" as const,   label: "Platform Updates",       desc: "New features and announcements", icon: <Globe size={15} /> },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-muted-foreground">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle value={notif[item.key]} onChange={() => setNotif((p) => ({ ...p, [item.key]: !p[item.key] }))} />
                </div>
              ))}
            </div>

            <SaveBtn onClick={() => fakeSave("Notification preferences saved!")} saving={saving} />
          </div>
        );

      /* ───── SECURITY ───── */
      case "security":
        return (
          <div className="space-y-6">
            <SectionHeader title="Security" desc="Keep your account safe with a strong password." />

            {/* Account info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2"><Mail size={15} className="text-secondary" /> Account</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground">{user?.email || "—"}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Verified</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-semibold text-foreground">HR Manager</p>
                  </div>
                  <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-semibold text-secondary">HR</span>
                </div>
              </div>
            </div>

            {/* Change password */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2"><Lock size={15} className="text-secondary" /> Change Password</h3>
              <div className="space-y-3 max-w-md">
                <PwField label="Current Password" value={pw.current} show={showPw.current}
                  onChange={(v) => setPw((p) => ({ ...p, current: v }))}
                  onToggle={() => setShowPw((p) => ({ ...p, current: !p.current }))} />
                <PwField label="New Password" value={pw.next} show={showPw.next}
                  onChange={(v) => setPw((p) => ({ ...p, next: v }))}
                  onToggle={() => setShowPw((p) => ({ ...p, next: !p.next }))} />
                <PwField label="Confirm New Password" value={pw.confirm} show={showPw.confirm}
                  onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
                  onToggle={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))} />
                {pwErr && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertTriangle size={12} /> {pwErr}
                  </p>
                )}
                <div className="pt-1">
                  <SaveBtn label="Update Password" onClick={handlePasswordChange} saving={saving} icon={<Shield size={14} />} />
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2"><LogOut size={15} className="text-secondary" /> Active Sessions</h3>
              <div className="rounded-xl border border-border px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Current session</p>
                  <p className="text-xs text-muted-foreground">India · Chrome · Just now</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
              </div>
            </div>
          </div>
        );

      /* ───── APPEARANCE ───── */
      case "appearance":
        return (
          <div className="space-y-6">
            <SectionHeader title="Appearance" desc="Customize how UnivHire looks for you." />

            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
              {/* Theme */}
              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Theme</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["light", "system"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        theme === t ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full border-2 ${theme === t ? "bg-foreground border-foreground" : "border-muted-foreground"}`} />
                      {t === "light" ? "☀️  Light" : "💻  System Default"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Display Density</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["comfortable", "compact"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        density === d ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full border-2 ${density === d ? "bg-foreground border-foreground" : "border-muted-foreground"}`} />
                      {d === "comfortable" ? "🗂  Comfortable" : "📋  Compact"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent preview */}
              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Accent Colour</label>
                <div className="flex gap-3">
                  {["bg-secondary", "bg-purple-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`h-8 w-8 rounded-full ${c} ring-offset-2 ring-offset-background transition hover:scale-110 focus:ring-2 focus:ring-foreground`}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <SaveBtn onClick={() => fakeSave("Appearance saved!")} saving={saving} />
          </div>
        );

      /* ───── ACCOUNT / DANGER ZONE ───── */
      case "account":
        return (
          <div className="space-y-6">
            <SectionHeader title="Account" desc="Manage your account and data." />

            {/* Go to profile */}
            <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-sm">Profile Page</p>
                <p className="text-xs text-muted-foreground mt-0.5">Edit your public-facing profile information.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/hr/profile")}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Go to Profile <ChevronRight size={14} />
              </button>
            </div>

            {/* Export data */}
            <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-sm">Export Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Download a copy of your job postings and applications.</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Export CSV
              </button>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Trash2 size={15} className="text-red-500" />
                <h3 className="font-bold text-red-500 text-sm">Danger Zone</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Once you delete your account, all job postings, applications, and data are permanently removed. This cannot be undone.
              </p>
              <div className="space-y-3 max-w-sm">
                <label className="block text-xs font-medium text-muted-foreground">
                  Type <span className="font-bold text-foreground">{user?.email}</span> to confirm deletion
                </label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-red-200 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-red-400 transition"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteEmail !== user?.email}
                  className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> Delete My Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="w-full px-6 py-10 md:px-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/hr/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your HR account, notifications, and preferences</p>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <Check size={15} /> {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout */}
        <div className="flex gap-8 items-start">
          {/* ── Sidebar ── */}
          <aside className="w-64 shrink-0">
            <nav className="rounded-2xl bg-white shadow-sm overflow-hidden">
              {SIDEBAR_ITEMS.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${
                      i < SIDEBAR_ITEMS.length - 1 ? "border-b border-border" : ""
                    } ${isActive ? "bg-foreground" : "hover:bg-muted"}`}
                  >
                    <span className={`shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs truncate ${isActive ? "text-white/60" : "text-muted-foreground"}`}>
                        {item.desc}
                      </p>
                    </div>
                    {isActive && <ChevronRight size={14} className="shrink-0 text-white/60" />}
                  </button>
                );
              })}
            </nav>

            {/* Logout quick-action */}
            <button
              type="button"
              onClick={() => { logout(); navigate("/"); }}
              className="mt-4 w-full flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition shadow-sm"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ──────────────────────────────────────────────────── */

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pb-2 border-b border-border">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40 transition"
      />
    </div>
  );
}

function PwField({
  label, value, show, onChange, onToggle,
}: {
  label: string; value: string; show: boolean; onChange: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-foreground/40 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function SaveBtn({
  onClick, saving, label = "Save Changes", icon = <Check size={14} />,
}: {
  onClick: () => void; saving: boolean; label?: string; icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition disabled:opacity-50"
    >
      {saving
        ? <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        : icon}
      {saving ? "Saving…" : label}
    </button>
  );
}
