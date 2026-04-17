import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { SmartNavbar } from "../../components/SmartNavbar";

const STATUS_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  Pending:     { icon: <Clock size={13} />,         color: "bg-amber-100 text-amber-700" },
  Shortlisted: { icon: <CheckCircle2 size={13} />,  color: "bg-emerald-100 text-emerald-700" },
  Rejected:    { icon: <XCircle size={13} />,       color: "bg-red-100 text-red-600" },
  Hired:       { icon: <Trophy size={13} />,        color: "bg-purple-100 text-purple-700" },
};

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { data: applications, isPending } = useQuery("JobApplication", { orderBy: { createdAt: "desc" } });

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
              const s = STATUS_STYLES[app.status] || STATUS_STYLES["Pending"];
              return (
                <motion.div key={app.id} className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{app.candidateName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Applied {new Date(app.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
                    {s.icon}{app.status}
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