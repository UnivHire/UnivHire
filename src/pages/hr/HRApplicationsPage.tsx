import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const STATUSES = ["PENDING", "SHORTLISTED", "REJECTED", "HIRED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  HIRED: "bg-purple-100 text-purple-700",
};

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
      const response = await fetch("http://localhost:5000/api/applications", {
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
    const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
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
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
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
          <div className="space-y-3">
            {apps.map((app, i) => (
              <motion.div key={app.id} className="rounded-2xl bg-white px-6 py-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div>
                  <p className="font-semibold text-foreground">{app.candidate?.name || "Candidate"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.candidate?.email || "No email"} · Applied {new Date(app.appliedAt).toLocaleDateString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.job?.title || "Job"} · {app.job?.location || "Location"}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/hr/applications/${app.id}`)}
                    className="mt-1 text-xs font-semibold text-secondary hover:underline"
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