import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { useAuthStore } from "../../store/authStore";
import { useCandidateStore } from "../../store/candidateStore";

export function CandidateProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, updateProfile, syncFromAuth } = useCandidateStore();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    syncFromAuth(user || null);
  }, [syncFromAuth, user]);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

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

  const saveChanges = () => {
    updateProfile(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
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
          description="Keep your candidate profile complete so you look credible and application-ready across every verified university role."
          actions={
            <button
              type="button"
              onClick={saveChanges}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
            >
              <Save size={15} />
              Save profile
            </button>
          }
        />

        {saved ? (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Check size={14} /> Profile updated
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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
              <p className="mt-1 text-sm text-white">{draft.headline}</p>
              <div className="mt-5 space-y-2 text-sm text-white">
                <p className="flex items-center gap-2 text-white">
                  <MapPin size={14} /> {draft.location || "Location not added"}
                </p>
                <p className="flex items-center gap-2 text-white">
                  <Briefcase size={14} /> {draft.preferredRole || "Preferred role not added"}
                </p>
                <p className="flex items-center gap-2 text-white">
                  <Sparkles size={14} /> {draft.availability}
                </p>
              </div>
            </motion.div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-foreground">Profile checklist</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <ChecklistRow done={Boolean(draft.phone)} label="Add your phone number" />
                <ChecklistRow done={Boolean(draft.about)} label="Write a strong about section" />
                <ChecklistRow done={draft.skills.length > 0} label="List your skills" />
                <ChecklistRow done={Boolean(draft.resumeUrl)} label="Attach resume link" />
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            <SectionCard title="Personal details" icon={<User size={15} />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
                <Field label="Email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
                <Field label="Phone" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
                <Field label="Location" value={draft.location} onChange={(value) => setDraft({ ...draft, location: value })} />
              </div>
            </SectionCard>

            <SectionCard title="Career snapshot" icon={<Edit3 size={15} />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Headline"
                  value={draft.headline}
                  onChange={(value) => setDraft({ ...draft, headline: value })}
                />
                <Field
                  label="Preferred role"
                  value={draft.preferredRole}
                  onChange={(value) => setDraft({ ...draft, preferredRole: value })}
                />
                <Field
                  label="Experience level"
                  value={draft.experienceLevel}
                  onChange={(value) => setDraft({ ...draft, experienceLevel: value })}
                />
                <Field
                  label="Availability"
                  value={draft.availability}
                  onChange={(value) => setDraft({ ...draft, availability: value })}
                />
                <Field
                  label="Resume URL"
                  value={draft.resumeUrl}
                  onChange={(value) => setDraft({ ...draft, resumeUrl: value })}
                />
                <Field
                  label="Portfolio URL"
                  value={draft.portfolioUrl}
                  onChange={(value) => setDraft({ ...draft, portfolioUrl: value })}
                />
              </div>
            </SectionCard>

            <SectionCard title="About me" icon={<Mail size={15} />}>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Summary
                </span>
                <textarea
                  value={draft.about}
                  onChange={(e) => setDraft({ ...draft, about: e.target.value })}
                  rows={5}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                />
              </label>

              <label className="mt-4 grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills
                </span>
                <input
                  type="text"
                  value={draft.skills.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      skills: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Communication, MS Office, Teaching, Coordination"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                />
              </label>
            </SectionCard>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
      />
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
