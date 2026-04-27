import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Edit3,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { useAuthStore } from "../../store/authStore";
import {
  normalizeCandidateProfile,
  serializeCandidateProfile,
  useCandidateStore,
  type CandidateProfile,
} from "../../store/candidateStore";
import { API_BASE } from "../../lib/api";

const EXPERIENCE_OPTIONS = ["Fresher", "1-3 years", "3-5 years", "5+ years"];
const AVAILABILITY_OPTIONS = [
  "Immediately available",
  "Available in 15 days",
  "Available in 30 days",
  "Open to discuss",
];
const ROLE_OPTIONS = ["Faculty", "Trainer", "Operations", "Security", "Driver", "Administration"];

const COMPLETION_FIELDS: { key: keyof CandidateProfile; label: string }[] = [
  { key: "name", label: "Add full name" },
  { key: "email", label: "Add email" },
  { key: "phone", label: "Add phone number" },
  { key: "headline", label: "Write headline" },
  { key: "preferredRole", label: "Pick target role" },
  { key: "location", label: "Add location" },
  { key: "about", label: "Write summary" },
  { key: "resumeUrl", label: "Attach resume link" },
  { key: "experienceLevel", label: "Set experience" },
  { key: "availability", label: "Set availability" },
  { key: "skills", label: "List skills" },
];

export function CandidateProfilePage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { profile, updateProfile, syncFromAuth } = useCandidateStore();
  const [draft, setDraft] = useState(profile);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    syncFromAuth(user || null);
    if (!token) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    fetch(`${API_BASE}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        return data;
      })
      .then((data) => {
        if (!alive) return;
        const normalizedProfile = normalizeCandidateProfile(data);
        updateProfile(normalizedProfile);
        setDraft(normalizedProfile);
        setError("");
      })
      .catch((err: Error) => {
        if (!alive) return;
        setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncFromAuth, user, token]);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useEffect(() => {
    if (!status) return;
    const handle = window.setTimeout(() => setStatus(""), 2500);
    return () => window.clearTimeout(handle);
  }, [status]);

  const initials = useMemo(
    () =>
      (draft.name || "Candidate")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [draft.name]
  );

  const completedItems = useMemo(
    () =>
      COMPLETION_FIELDS.filter(({ key }) => {
        const value = draft[key];
        return Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
      }),
    [draft]
  );
  const completion = Math.round((completedItems.length / COMPLETION_FIELDS.length) * 100);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const setField = (key: keyof CandidateProfile, value: string | string[]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || draft.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    setField("skills", [...draft.skills, skill]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setField(
      "skills",
      draft.skills.filter((item) => item !== skill)
    );
  };

  const saveChanges = async () => {
    if (!token) return;
    const normalizedDraft = normalizeCandidateProfile(draft);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(serializeCandidateProfile(normalizedDraft)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      const savedProfile = normalizeCandidateProfile(data);
      updateProfile(savedProfile);
      setDraft(savedProfile);
      setStatus("Profile updated");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="w-full px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <CandidatePageHeader
          eyebrow="Candidate Profile"
          title="My Profile"
          description="Keep your candidate profile complete so verified universities can review your background with confidence."
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft(profile)}
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={!isDirty || saving || loading}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving" : "Save profile"}
              </button>
            </div>
          }
        />

        {status ? (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Check size={14} /> {status}
          </div>
        ) : null}
        {error ? (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
            <X size={14} /> {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <motion.div
              className="rounded-[28px] bg-foreground p-7 text-white shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-white">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-secondary">{draft.name || "Your name"}</h2>
              <p className="mt-1 text-sm leading-6 text-white/80">
                {draft.headline || "Add a concise headline for your profile."}
              </p>
              <div className="mt-5 space-y-2 text-sm text-white">
                <PreviewLine icon={<MapPin size={14} />} value={draft.location || "Location not added"} />
                <PreviewLine icon={<Briefcase size={14} />} value={draft.preferredRole || "Preferred role not added"} />
                <PreviewLine icon={<Sparkles size={14} />} value={draft.availability || "Availability not added"} />
              </div>
            </motion.div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Profile strength</h3>
                <span className="text-sm font-bold text-secondary">{completion}%</span>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${completion}%` }} />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {COMPLETION_FIELDS.map((item) => {
                  const value = draft[item.key];
                  const done = Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim());
                  return <ChecklistRow key={item.key} done={done} label={item.label} />;
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-foreground">Profile links</h3>
              <LinkPreview label="Resume" href={draft.resumeUrl} />
              <LinkPreview label="Portfolio" href={draft.portfolioUrl} />
            </div>
          </aside>

          <main className="space-y-5">
            {loading ? (
              <div className="grid gap-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-52 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <SectionCard title="Personal Details" icon={<User size={15} />}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={draft.name} onChange={(value) => setField("name", value)} />
                    <Field label="Email" value={draft.email} onChange={(value) => setField("email", value)} type="email" disabled />
                    <Field label="Phone" value={draft.phone} onChange={(value) => setField("phone", value)} type="tel" placeholder="+91 98765 43210" />
                    <Field label="Location" value={draft.location} onChange={(value) => setField("location", value)} placeholder="Delhi, India" />
                  </div>
                </SectionCard>

                <SectionCard title="Career Snapshot" icon={<Edit3 size={15} />}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Headline"
                      value={draft.headline}
                      onChange={(value) => setField("headline", value)}
                      placeholder="Assistant professor with strong classroom experience"
                    />
                    <SelectField
                      label="Preferred role"
                      value={draft.preferredRole}
                      options={ROLE_OPTIONS}
                      onChange={(value) => setField("preferredRole", value)}
                    />
                    <SelectField
                      label="Experience level"
                      value={draft.experienceLevel}
                      options={EXPERIENCE_OPTIONS}
                      onChange={(value) => setField("experienceLevel", value)}
                    />
                    <SelectField
                      label="Availability"
                      value={draft.availability}
                      options={AVAILABILITY_OPTIONS}
                      onChange={(value) => setField("availability", value)}
                    />
                    <Field
                      label="Resume URL"
                      value={draft.resumeUrl}
                      onChange={(value) => setField("resumeUrl", value)}
                      type="url"
                      placeholder="https://..."
                    />
                    <Field
                      label="Portfolio URL"
                      value={draft.portfolioUrl}
                      onChange={(value) => setField("portfolioUrl", value)}
                      type="url"
                      placeholder="https://..."
                    />
                  </div>
                </SectionCard>

                <SectionCard title="About And Skills" icon={<Mail size={15} />}>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Summary
                    </span>
                    <textarea
                      value={draft.about}
                      onChange={(e) => setField("about", e.target.value)}
                      rows={6}
                      placeholder="Share your strengths, campus experience, teaching style, or the kind of role you want next."
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                    />
                  </label>

                  <div className="mt-5">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Skills
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Add a skill"
                        className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-white transition hover:opacity-85"
                        aria-label="Add skill"
                      >
                        <Plus size={17} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {draft.skills.length > 0 ? (
                        draft.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-muted-foreground transition hover:text-foreground"
                              aria-label={`Remove ${skill}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-foreground">
          {icon}
        </span>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
        }`}
      >
        <Check size={13} />
      </span>
      <span>{label}</span>
    </div>
  );
}

function PreviewLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <p className="flex items-center gap-2 text-white">
      {icon} {value}
    </p>
  );
}

function LinkPreview({ label, href }: { label: string; href: string }) {
  const isReady = Boolean(href.trim());

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-background px-4 py-3 last:mb-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-foreground">
          <LinkIcon size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{isReady ? href : "Not added"}</p>
        </div>
      </div>
      {isReady ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-white"
          aria-label={`Open ${label}`}
        >
          <ExternalLink size={14} />
        </a>
      ) : null}
    </div>
  );
}
