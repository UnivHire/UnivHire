import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Clock, CheckCircle2, MapPin, XCircle, Trophy } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const STATUS_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  PENDING: { icon: <Clock size={13} />, color: "bg-amber-100 text-amber-700" },
  SHORTLISTED: { icon: <CheckCircle2 size={13} />, color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { icon: <XCircle size={13} />, color: "bg-red-100 text-red-600" },
  HIRED: { icon: <Trophy size={13} />, color: "bg-purple-100 text-purple-700" },
};

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!token) {
        setApplications([]);
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch applications");
        setApplications(data || []);
      } catch {
        setApplications([]);
      } finally {
        setIsPending(false);
      }
    };

    loadApplications();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium">{applications?.length || 0} total</span>
        </div>

        {isPending && (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isPending && (!applications || applications.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-muted-foreground">You haven&#39;t applied to any jobs yet.</p>
            <button type="button" onClick={() => navigate("/dashboard")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">Browse Jobs</button>
          </div>
        )}

        {!isPending && applications && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app, i) => {
              const normalizedStatus = String(app.status || "PENDING").toUpperCase();
              const s = STATUS_STYLES[normalizedStatus] || STATUS_STYLES["PENDING"];
              return (
                <motion.div key={app.id} className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{app.job?.title || "Job"}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={11} />{app.job?.location || "Location"}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{app.job?.jobType || "Role"}</span>
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString("en-IN")}</span>
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
                    {s.icon}{normalizedStatus.charAt(0) + normalizedStatus.slice(1).toLowerCase()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}