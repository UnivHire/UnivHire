import { API_BASE } from "../../lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, MapPin, Briefcase, Building2, CalendarDays } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const ROLE_FILTERS = ["All", "Trainer", "Driver", "Faculty", "Security", "Peon", "Operations", "Admin Staff", "Other"];

const THEME_CLASS_BY_KEY: Record<string, string> = {
  peach: "card-peach",
  mint: "card-mint",
  lavender: "card-lavender",
  sky: "card-sky",
  pink: "card-pink",
  cream: "card-cream",
};

function resolveThemeClass(job: any) {
  const selected = String(job?.cardTheme || "").toLowerCase();
  if (selected && THEME_CLASS_BY_KEY[selected]) return THEME_CLASS_BY_KEY[selected];
  const keys = Object.keys(THEME_CLASS_BY_KEY);
  const base = String(job?.id || job?.title || "job");
  const hash = Array.from(base).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return THEME_CLASS_BY_KEY[keys[hash % keys.length]];
}

function formatPostedDate(iso?: string) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HRJobsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`);
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const hrJobs = (data || []).filter((j: any) => j?.hrId === user?.id);
      setJobs(hrJobs);
    } catch {
      setJobs([]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (token && user?.id) {
      loadJobs();
    } else {
      setJobs([]);
      setIsPending(false);
    }
  }, [token, user?.id]);

  const removeJob = async (jobId: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const filteredAndSortedJobs = [...jobs]
    .filter((job) => roleFilter === "All" || String(job.jobType || "").toLowerCase() === roleFilter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "title-asc") return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortBy === "title-desc") return String(b.title || "").localeCompare(String(a.title || ""));
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Job Postings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filteredAndSortedJobs.length || 0} postings found</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/hr/applications${roleFilter !== "All" ? `?jobType=${encodeURIComponent(roleFilter)}` : ""}`)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background transition"
            >
              Manage Applications
            </button>
            <button type="button" onClick={() => navigate("/hr/post-job")} className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
              <PlusCircle size={15} /> Post New Job
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-semibold">Application role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
            >
              {ROLE_FILTERS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </label>
        </div>

        {isPending && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}</div>}
        {!isPending && (!jobs || jobs.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-muted-foreground">No job postings yet.</p>
            <button type="button" onClick={() => navigate("/hr/post-job")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">Post Your First Job</button>
          </div>
        )}
        {!isPending && jobs && jobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAndSortedJobs.map((j, i) => (
              <motion.div
                key={j.id}
                className={`${resolveThemeClass(j)} rounded-2xl border border-border p-5 shadow-sm`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {j.organizationLogoUrl ? (
                      <img
                        src={String(j.organizationLogoUrl).startsWith("http") ? j.organizationLogoUrl : `${API_BASE}${j.organizationLogoUrl}`}
                        alt={`${j.organizationName || j.title} logo`}
                        className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-white/40 text-foreground/60">
                        <Building2 size={16} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-foreground">{j.title}</p>
                      <p className="truncate text-xs font-medium text-foreground/65">{j.organizationName || user?.university || "University"}</p>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${j.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {j.status === "OPEN" ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-foreground/15 bg-white/60 px-2.5 py-1 text-xs font-medium text-foreground">{j.workplaceType ? String(j.workplaceType).replace("_", "-") : "On-site"}</span>
                  <span className="rounded-full border border-foreground/15 bg-white/60 px-2.5 py-1 text-xs font-medium text-foreground">{j.jobType || "N/A"}</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm leading-6 text-foreground/75">
                  {j.description || "No description added for this posting yet."}
                </p>

                <div className="mb-4 grid gap-2 text-xs text-foreground/65 sm:grid-cols-2">
                  <p className="flex items-center gap-1.5"><MapPin size={12} />{j.location || "Location not specified"}</p>
                  <p className="flex items-center gap-1.5"><CalendarDays size={12} />Posted {formatPostedDate(j.createdAt)}</p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/hr/applications?jobType=${encodeURIComponent(j.jobType || "")}`)}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background"
                  >
                    View Applications
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (window.confirm("Delete this job posting?")) removeJob(j.id); }}
                    className="rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
            {filteredAndSortedJobs.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm md:col-span-2">
                <p className="text-sm text-muted-foreground">No jobs found for selected role filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}