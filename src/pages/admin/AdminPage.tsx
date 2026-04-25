import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Briefcase, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";
import { API_BASE } from "../../lib/api";

export function AdminPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, totalUsers: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "users">("jobs");

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/admin/stats`, { headers: authHeaders })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${API_BASE}/api/admin/jobs`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoadingJobs(false); })
      .catch(() => setLoadingJobs(false));

    fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleVerify = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/jobs/${jobId}/verify`, {
        method: "PATCH",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch (e) {
      console.error(e);
    }
  };

  const statCards = [
    { icon: <Briefcase size={20} />, label: "Total Jobs", value: stats.totalJobs, color: "card-peach" },
    { icon: <Users size={20} />, label: "Applications", value: stats.totalApplications, color: "card-mint" },
    { icon: <ClipboardList size={20} />, label: "Users", value: stats.totalUsers, color: "card-lavender" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {/* Header */}
        <motion.div
          className="mb-8 rounded-2xl bg-white px-8 py-6 shadow-sm flex items-center justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-secondary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Platform overview & verification controls</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              className={`${s.color} flex items-center gap-4 rounded-2xl p-5`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-foreground/60">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2">
          {(["jobs", "users"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-foreground text-white"
                  : "border border-border text-foreground hover:bg-background"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        {activeTab === "jobs" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-bold text-foreground">Job Postings — Verification Queue</h2>
            {loadingJobs ? (
              <div className="h-40 rounded-xl bg-muted animate-pulse" />
            ) : (
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{j.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {j.organizationName || j.hr?.university || "Unknown"} · {j.location}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        j.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {j.isVerified ? "Verified" : "Pending"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleVerify(j.id)}
                      className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        j.isVerified
                          ? "border border-red-200 text-red-500 hover:bg-red-50"
                          : "bg-emerald-600 text-white hover:opacity-80"
                      }`}
                    >
                      {j.isVerified ? <><XCircle size={12} /> Revoke</> : <><CheckCircle size={12} /> Verify</>}
                    </button>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No job postings yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {activeTab === "users" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-bold text-foreground">Registered Users</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.university || "—"}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "HR"
                        ? "bg-secondary/15 text-secondary"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}