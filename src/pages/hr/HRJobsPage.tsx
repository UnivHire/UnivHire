import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, MapPin, Briefcase } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const ROLE_FILTERS = ["All", "Trainer", "Driver", "Faculty", "Security", "Peon", "Operations", "Admin Staff", "Other"];

export function HRJobsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const loadJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/jobs");
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
    const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
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
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
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

        {isPending && <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}</div>}
        {!isPending && (!jobs || jobs.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-muted-foreground">No job postings yet.</p>
            <button type="button" onClick={() => navigate("/hr/post-job")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">Post Your First Job</button>
          </div>
        )}
        {!isPending && jobs && jobs.length > 0 && (
          <div className="space-y-3">
            {filteredAndSortedJobs.map((j, i) => (
              <motion.div key={j.id} className="rounded-2xl bg-white px-6 py-5 shadow-sm flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{j.title}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={11} />{j.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} />{j.jobType}</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${j.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {j.status === "OPEN" ? "Open" : "Closed"}
                </span>
                <button type="button" onClick={() => { if (window.confirm("Delete this job posting?")) removeJob(j.id); }}
                  className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition">
                  Delete
                </button>
              </motion.div>
            ))}
            {filteredAndSortedJobs.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">No jobs found for selected role filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}