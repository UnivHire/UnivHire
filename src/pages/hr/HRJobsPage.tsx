import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, MapPin, Briefcase } from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { SmartNavbar } from "../../components/SmartNavbar";

export function HRJobsPage() {
  const navigate = useNavigate();
  const { data: jobs, isPending } = useQuery("JobPosting", { orderBy: { createdAt: "desc" } });
  const { remove } = useMutation("JobPosting");

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
            <p className="text-sm text-muted-foreground mt-0.5">{jobs?.length || 0} postings found</p>
          </div>
          <button type="button" onClick={() => navigate("/hr/post-job")} className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
            <PlusCircle size={15} /> Post New Job
          </button>
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
            {jobs.map((j, i) => (
              <motion.div key={j.id} className="rounded-2xl bg-white px-6 py-5 shadow-sm flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{j.title}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={11} />{j.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} />{j.category}</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${j.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {j.isVerified ? "Verified" : "Pending"}
                </span>
                <button type="button" onClick={() => { if (window.confirm("Delete this job posting?")) remove(j.id); }}
                  className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition">
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}