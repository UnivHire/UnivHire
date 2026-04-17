import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { SmartNavbar } from "../../components/SmartNavbar";

const STATUSES = ["Pending","Shortlisted","Rejected","Hired"];
const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Shortlisted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
  Hired: "bg-purple-100 text-purple-700",
};

export function HRApplicationsPage() {
  const navigate = useNavigate();
  const { data: apps, isPending } = useQuery("JobApplication", { orderBy: { createdAt: "desc" } });
  const { update } = useMutation("JobApplication");

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
                  <p className="font-semibold text-foreground">{app.candidateName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.candidatePhone} · Applied {new Date(app.createdAt).toLocaleDateString("en-IN")}</p>
                  {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline mt-0.5 inline-block">View Resume ↗</a>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => update(app.id, { status: s })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${app.status === s ? STATUS_COLOR[s] : "bg-muted text-muted-foreground"}`}>
                      {s}
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