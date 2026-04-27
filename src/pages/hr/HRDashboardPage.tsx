import { API_BASE } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Users, PlusCircle, ClipboardList, TrendingUp } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

export function HRDashboardPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/jobs?includeClosed=1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch jobs");

        // Show only current HR's jobs on HR dashboard.
        const hrJobs = (data || []).filter((j: any) => j?.hrId === user?.id);
        setJobs(hrJobs);
      } catch {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (token && user?.id) {
      load();
    } else {
      setJobs([]);
      setLoadingJobs(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    const loadApplications = async () => {
      if (!token) {
        setApplications([]);
        setLoadingApplications(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch applications");
        setApplications(data || []);
      } catch {
        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
  }, [token]);

  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);
  const recentApplications = useMemo(() => applications.slice(0, 5), [applications]);

  const stats = [
    { icon: <Briefcase size={20} />, label: "Active Jobs", value: jobs?.length || 0, color: "card-peach" },
    { icon: <Users size={20} />, label: "Total Applicants", value: applications?.length || 0, color: "card-mint" },
    { icon: <ClipboardList size={20} />, label: "Shortlisted", value: applications?.filter((a) => String(a.status).toUpperCase() === "SHORTLISTED").length || 0, color: "card-lavender" },
    { icon: <TrendingUp size={20} />, label: "Hired", value: applications?.filter((a) => String(a.status).toUpperCase() === "HIRED").length || 0, color: "card-sky" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        {/* Welcome */}
        <motion.div className="mb-8 rounded-2xl bg-white px-8 py-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div>
            <h1 className="text-xl font-bold text-foreground">HR Dashboard — {user?.university || "Your University"} 🎓</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your job postings and review applications</p>
          </div>
          <button type="button" onClick={() => navigate("/hr/post-job")} className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
            <PlusCircle size={15} /> Post New Job
          </button>
        </motion.div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} className={`${s.color} flex items-center gap-4 rounded-2xl p-5`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-foreground">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-foreground/60">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-foreground">Recent Job Postings</h2>
              <button type="button" onClick={() => navigate("/hr/jobs")} className="text-xs font-semibold text-secondary hover:underline">View all</button>
            </div>
            {loadingJobs ? <div className="h-40 rounded-xl bg-muted animate-pulse" /> : (
              <div className="space-y-3">
                {(recentJobs && recentJobs.length > 0 ? recentJobs : []).map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.location} · {j.jobType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${j.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {j.status === "OPEN" ? "Open" : "Closed"}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/hr/jobs/${j.id}/edit`)}
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-background"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {(!jobs || jobs.length === 0) && <p className="text-sm text-muted-foreground py-4 text-center">No jobs posted yet.</p>}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-foreground">Recent Applications</h2>
              <button type="button" onClick={() => navigate("/hr/applications")} className="text-xs font-semibold text-secondary hover:underline">View all</button>
            </div>
            {loadingApplications ? <div className="h-40 rounded-xl bg-muted animate-pulse" /> : (
              <div className="space-y-3">
                {recentApplications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.candidate?.name || "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">{a.job?.title || "Job"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${String(a.status).toUpperCase() === "HIRED" ? "bg-purple-100 text-purple-700" : String(a.status).toUpperCase() === "SHORTLISTED" ? "bg-emerald-100 text-emerald-700" : String(a.status).toUpperCase() === "REJECTED" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {String(a.status).charAt(0).toUpperCase() + String(a.status).slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
                {recentApplications.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No applications yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}