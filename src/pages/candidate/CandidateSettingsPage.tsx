import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Shield,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
} from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { useAuthStore } from "../../store/authStore";
import { useCandidateStore } from "../../store/candidateStore";

type Section = "preferences" | "notifications" | "security" | "privacy" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "preferences", label: "Preferences", icon: <SlidersHorizontal size={16} />, desc: "Jobs, alerts, and workspace defaults" },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} />, desc: "Email and in-app update controls" },
  { id: "security", label: "Security", icon: <Shield size={16} />, desc: "Password and account safety" },
  { id: "privacy", label: "Privacy", icon: <Globe size={16} />, desc: "Visibility and relocation settings" },
  { id: "account", label: "Account", icon: <User size={16} />, desc: "Profile links and danger zone" },
];

export function CandidateSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    notificationSettings,
    preferences,
    updateNotificationSettings,
    updatePreferences,
  } = useCandidateStore();

  const [active, setActive] = useState<Section>("preferences");
  const [toast, setToast] = useState("");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [deleteEmail, setDeleteEmail] = useState("");

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const showSaved = (message: string) => setToast(message);

  const Toggle = ({
    value,
    onToggle,
  }: {
    value: boolean;
    onToggle: () => void;
  }) => (
    <button type="button" onClick={onToggle}>
      {value ? (
        <ToggleRight size={30} className="text-secondary" />
      ) : (
        <ToggleLeft size={30} className="text-muted-foreground" />
      )}
    </button>
  );

  const changePassword = () => {
    if (!passwords.current || passwords.next.length < 8 || passwords.next !== passwords.confirm) {
      setToast("Please enter a valid password update.");
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    showSaved("Password updated");
  };

  const deleteAccount = () => {
    if (deleteEmail !== user?.email) return;
    logout();
    navigate("/");
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
          eyebrow="Candidate Settings"
          title="Settings"
          description="Control how UnivHire works for you, from job preferences and notifications to privacy and account safety."
        />

        {toast ? (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Check size={14} /> {toast}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-3 shadow-sm">
            {SECTIONS.map((section) => {
              const isActive = active === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActive(section.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${
                    isActive ? "bg-foreground text-white" : "text-foreground hover:bg-background"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-muted-foreground"}>{section.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">{section.label}</span>
                    <span className={`block text-xs ${isActive ? "text-white/65" : "text-muted-foreground"}`}>
                      {section.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <main className="space-y-5">
            {active === "preferences" ? (
              <SectionCard title="Workspace preferences">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Theme
                    </span>
                    <select
                      value={preferences.theme}
                      onChange={(e) => updatePreferences({ theme: e.target.value as "light" | "system" })}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                    >
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Density
                    </span>
                    <select
                      value={preferences.density}
                      onChange={(e) => updatePreferences({ density: e.target.value as "comfortable" | "compact" })}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Job alert frequency
                    </span>
                    <select
                      value={preferences.jobAlertFrequency}
                      onChange={(e) =>
                        updatePreferences({
                          jobAlertFrequency: e.target.value as "instant" | "daily" | "weekly",
                        })
                      }
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Minimum salary target
                    </span>
                    <input
                      type="number"
                      value={preferences.minSalaryK}
                      onChange={(e) => updatePreferences({ minSalaryK: Number(e.target.value) || 20 })}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => showSaved("Preferences saved")}
                  className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Save preferences
                </button>
              </SectionCard>
            ) : null}

            {active === "notifications" ? (
              <SectionCard title="Notification controls">
                <div className="space-y-4">
                  {[
                    { key: "applicationUpdates" as const, label: "Application updates", desc: "Status changes and follow-up prompts" },
                    { key: "matchingJobs" as const, label: "Matching jobs", desc: "New roles aligned with your profile" },
                    { key: "savedJobAlerts" as const, label: "Saved job alerts", desc: "Reminders for shortlisted jobs" },
                    { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of candidate activity and new jobs" },
                    { key: "marketingEmails" as const, label: "Product emails", desc: "Feature announcements and platform news" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl bg-background px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Toggle
                        value={notificationSettings[item.key]}
                        onToggle={() =>
                          updateNotificationSettings({
                            [item.key]: !notificationSettings[item.key],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => showSaved("Notification settings saved")}
                  className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Save notification settings
                </button>
              </SectionCard>
            ) : null}

            {active === "security" ? (
              <SectionCard title="Security">
                <div className="mb-5 rounded-2xl bg-background px-4 py-4">
                  <p className="text-sm font-semibold text-foreground">Account email</p>
                  <p className="mt-1 text-sm text-muted-foreground">{user?.email || "Not available"}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {(["current", "next", "confirm"] as const).map((field) => (
                    <label key={field} className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {field === "current"
                          ? "Current password"
                          : field === "next"
                          ? "New password"
                          : "Confirm password"}
                      </span>
                      <div className="relative">
                        <input
                          type={showPassword[field] ? "text" : "password"}
                          value={passwords[field]}
                          onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none focus:border-foreground/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={changePassword}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  <Lock size={15} />
                  Update password
                </button>
              </SectionCard>
            ) : null}

            {active === "privacy" ? (
              <SectionCard title="Privacy and visibility">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Profile visible to universities</p>
                      <p className="text-xs text-muted-foreground">Show your candidate profile to recruiters</p>
                    </div>
                    <Toggle
                      value={preferences.profileVisibleToUniversities}
                      onToggle={() =>
                        updatePreferences({
                          profileVisibleToUniversities: !preferences.profileVisibleToUniversities,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Open to relocate</p>
                      <p className="text-xs text-muted-foreground">Use relocation-friendly roles in recommendations</p>
                    </div>
                    <Toggle
                      value={preferences.openToRelocate}
                      onToggle={() =>
                        updatePreferences({ openToRelocate: !preferences.openToRelocate })
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showSaved("Privacy settings saved")}
                  className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Save privacy settings
                </button>
              </SectionCard>
            ) : null}

            {active === "account" ? (
              <SectionCard title="Account actions">
                <div className="space-y-4">
                  <ActionRow
                    icon={<Mail size={16} />}
                    title="Go to profile"
                    description="Update your headline, skills, links, and candidate summary."
                    actionLabel="Open profile"
                    onAction={() => navigate("/profile")}
                  />
                  <ActionRow
                    icon={<Bell size={16} />}
                    title="Review notifications"
                    description="Check unread updates from applications and matching jobs."
                    actionLabel="Open notifications"
                    onAction={() => navigate("/notifications")}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-red-600">
                    <Trash2 size={16} />
                    <p className="font-semibold">Danger zone</p>
                  </div>
                  <p className="text-sm text-red-500/90">
                    Type your email address to confirm account deletion.
                  </p>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="mt-4 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-red-400"
                    placeholder={user?.email || "your@email.com"}
                  />
                  <button
                    type="button"
                    onClick={deleteAccount}
                    disabled={deleteEmail !== user?.email}
                    className="mt-4 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete my account
                  </button>
                </div>
              </SectionCard>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function ActionRow({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-background px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-foreground">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}
