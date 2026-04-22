import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Building2, Mail, Phone, MapPin, Globe,
  Briefcase, Edit3, Check, X, Camera, Award, Users, FileText,
} from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

export function HRProfilePage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    designation: "HR Manager",
    department: "Human Resources",
    university: user?.university || "",
    location: "India",
    website: "",
    bio: "Dedicated HR professional passionate about connecting talented individuals with the right opportunities at our university.",
    linkedin: "",
    experience: "5+ years",
  });

  const [draft, setDraft] = useState({ ...profileData });

  const startEdit = (section: string) => {
    setDraft({ ...profileData });
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setDraft({ ...profileData });
    setEditingSection(null);
  };

  const saveEdit = async () => {
    setSaving(true);
    // Simulate API call - in production, patch /api/users/me
    await new Promise((r) => setTimeout(r, 800));
    setProfileData({ ...draft });
    setEditingSection(null);
    setSaving(false);
    setSuccessMsg("Profile updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const initials = profileData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { icon: <Briefcase size={18} />, label: "Jobs Posted", value: "—", color: "card-peach" },
    { icon: <Users size={18} />, label: "Total Applicants", value: "—", color: "card-mint" },
    { icon: <Award size={18} />, label: "Hires Made", value: "—", color: "card-lavender" },
    { icon: <FileText size={18} />, label: "Active Listings", value: "—", color: "card-sky" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/hr/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        {/* Success toast */}
        {successMsg && (
          <motion.div
            className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={15} /> {successMsg}
          </motion.div>
        )}

        {/* Hero banner */}
        <motion.div
          className="relative mb-6 overflow-hidden rounded-2xl bg-foreground px-8 pt-10 pb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/10 blur-2xl" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary text-3xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-foreground hover:bg-muted transition"
                title="Change photo"
              >
                <Camera size={13} />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
              <p className="text-sm text-white/60 mt-0.5">
                {profileData.designation} · {profileData.university || "University"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <MapPin size={11} /> {profileData.location}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <Briefcase size={11} /> {profileData.experience}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-xs text-white font-semibold">
                  HR Professional
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startEdit("personal")}
              className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              <Edit3 size={13} /> Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className={`${s.color} flex items-center gap-4 rounded-2xl p-5`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-foreground">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-foreground/60">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left column */}
          <div className="space-y-5">
            {/* Contact Info */}
            <SectionCard
              title="Contact Information"
              onEdit={() => startEdit("contact")}
              editing={editingSection === "contact"}
              onSave={saveEdit}
              onCancel={cancelEdit}
              saving={saving}
            >
              {editingSection === "contact" ? (
                <div className="space-y-3">
                  <InputField label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} type="email" />
                  <InputField label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} placeholder="+91 98765 43210" />
                  <InputField label="Location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
                  <InputField label="Website" value={draft.website} onChange={(v) => setDraft({ ...draft, website: v })} placeholder="https://university.edu" />
                  <InputField label="LinkedIn" value={draft.linkedin} onChange={(v) => setDraft({ ...draft, linkedin: v })} placeholder="linkedin.com/in/..." />
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<Mail size={14} />} label="Email" value={profileData.email} />
                  <InfoRow icon={<Phone size={14} />} label="Phone" value={profileData.phone || "—"} />
                  <InfoRow icon={<MapPin size={14} />} label="Location" value={profileData.location} />
                  <InfoRow icon={<Globe size={14} />} label="Website" value={profileData.website || "—"} />
                </div>
              )}
            </SectionCard>

            {/* Work Info */}
            <SectionCard
              title="Work Details"
              onEdit={() => startEdit("work")}
              editing={editingSection === "work"}
              onSave={saveEdit}
              onCancel={cancelEdit}
              saving={saving}
            >
              {editingSection === "work" ? (
                <div className="space-y-3">
                  <InputField label="Designation" value={draft.designation} onChange={(v) => setDraft({ ...draft, designation: v })} />
                  <InputField label="Department" value={draft.department} onChange={(v) => setDraft({ ...draft, department: v })} />
                  <InputField label="University" value={draft.university} onChange={(v) => setDraft({ ...draft, university: v })} />
                  <InputField label="Experience" value={draft.experience} onChange={(v) => setDraft({ ...draft, experience: v })} placeholder="e.g. 3-5 years" />
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<User size={14} />} label="Designation" value={profileData.designation} />
                  <InfoRow icon={<Building2 size={14} />} label="Department" value={profileData.department} />
                  <InfoRow icon={<Building2 size={14} />} label="University" value={profileData.university || "—"} />
                  <InfoRow icon={<Briefcase size={14} />} label="Experience" value={profileData.experience} />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="lg:col-span-3 space-y-5">
            {/* Bio */}
            <SectionCard
              title="About Me"
              onEdit={() => startEdit("bio")}
              editing={editingSection === "bio"}
              onSave={saveEdit}
              onCancel={cancelEdit}
              saving={saving}
            >
              {editingSection === "bio" ? (
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground resize-none outline-none focus:border-foreground/40 transition"
                  placeholder="Tell candidates and colleagues about yourself..."
                />
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profileData.bio}
                </p>
              )}
            </SectionCard>

            {/* Personal Info */}
            <SectionCard
              title="Personal Information"
              onEdit={() => startEdit("personal")}
              editing={editingSection === "personal"}
              onSave={saveEdit}
              onCancel={cancelEdit}
              saving={saving}
            >
              {editingSection === "personal" ? (
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Full Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                  <InputField label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} type="email" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoRow icon={<User size={14} />} label="Full Name" value={profileData.name} />
                  <InfoRow icon={<Mail size={14} />} label="Email" value={profileData.email} />
                  <InfoRow icon={<Building2 size={14} />} label="University" value={profileData.university || "—"} />
                  <InfoRow icon={<Briefcase size={14} />} label="Role" value="HR Manager" />
                </div>
              )}
            </SectionCard>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <QuickActionBtn
                  icon={<Briefcase size={16} />}
                  label="Post New Job"
                  onClick={() => navigate("/hr/post-job")}
                  color="bg-foreground text-white hover:opacity-80"
                />
                <QuickActionBtn
                  icon={<Users size={16} />}
                  label="View Applications"
                  onClick={() => navigate("/hr/applications")}
                  color="bg-secondary text-white hover:opacity-85"
                />
                <QuickActionBtn
                  icon={<FileText size={16} />}
                  label="My Listings"
                  onClick={() => navigate("/hr/jobs")}
                  color="border border-border text-foreground hover:bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title, children, onEdit, editing, onSave, onCancel, saving,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-foreground">{title}</h3>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
            >
              <X size={12} /> Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-white hover:opacity-80 transition disabled:opacity-50"
            >
              {saving ? (
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline"
          >
            <Edit3 size={12} /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
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

function QuickActionBtn({
  icon, label, onClick, color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${color}`}
    >
      {icon} {label}
    </button>
  );
}
