import { API_BASE } from "../../lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, CalendarDays, Mail, MapPin, UserRound } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const STATUSES = ["PENDING", "SHORTLISTED", "REJECTED", "HIRED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  HIRED: "bg-purple-100 text-purple-700",
};

const CARD_COLORS = ["card-peach", "card-mint", "card-lavender", "card-sky", "card-pink", "card-cream"];

function resolveCardClass(app: any) {
  const seed = String(app?.id || app?.job?.title || app?.candidate?.email || "application");
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CARD_COLORS[hash % CARD_COLORS.length];
}

function formatDate(iso?: string) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HRApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuthStore();
  const [apps, setApps] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const selectedJobType = (searchParams.get("jobType") || "").trim().toLowerCase();

  const loadApplications = async () => {
    if (!token) {
      setApps([]);
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch applications");
      const list = data || [];
      const filteredList = selectedJobType
        ? list.filter((app: any) => String(app?.job?.jobType || "").toLowerCase() === selectedJobType)
        : list;
      setApps(filteredList);
    } catch {
      setApps([]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token, selectedJobType]);

  const updateStatus = async (applicationId: string, status: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return;

    setApps((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">All Applications</h1>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium">{apps?.length || 0} total</span>
        </div>

        {selectedJobType && (
          <div className="mb-4 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm">
            Showing applications for role: <span className="font-semibold">{selectedJobType.charAt(0).toUpperCase() + selectedJobType.slice(1)}</span>
          </div>
        )}

        {isPending && <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>}

        {!isPending && (!apps || apps.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-muted-foreground">No applications yet. Post a job to start receiving applications.</p>
          </div>
        )}

        {!isPending && apps && apps.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {apps.map((app, i) => (
              <motion.div
                key={app.id}
                className={`${resolveCardClass(app)} rounded-2xl border border-border p-5 shadow-sm`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-white/60 text-foreground">
                      <UserRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{app.candidate?.name || "Candidate"}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground/65 truncate"><Mail size={11} />{app.candidate?.email || "No email"}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[String(app.status).toUpperCase()] || "bg-muted text-muted-foreground"}`}>
                    {String(app.status || "PENDING").charAt(0) + String(app.status || "PENDING").slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="mb-4 grid gap-2 text-xs text-foreground/70 sm:grid-cols-2">
                  <p className="flex items-center gap-1.5"><Briefcase size={12} />{app.job?.title || "Job"}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} />{app.job?.location || "Location"}</p>
                  <p className="flex items-center gap-1.5"><CalendarDays size={12} />Applied {formatDate(app.appliedAt)}</p>
                  <p className="flex items-center gap-1.5"><Briefcase size={12} />{app.job?.jobType || "N/A"}</p>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/hr/applications/${app.id}`)}
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    View Application
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => updateStatus(app.id, s)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${String(app.status).toUpperCase() === s ? STATUS_COLOR[s] : "bg-muted text-muted-foreground"}`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}