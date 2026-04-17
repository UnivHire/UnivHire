import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useState } from "react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: job, isPending } = useQuery("JobPosting", id || "");
  const { create, isPending: applying } = useMutation("JobApplication");
  const [applied, setApplied] = useState(false);
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState("");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await create({ jobId: id, candidateName: user?.name || "Candidate", candidatePhone: phone, status: "Pending", resumeUrl: resume });
    setApplied(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to jobs
        </button>

        {isPending && (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isPending && !job && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-muted-foreground">Job not found. It may have been removed.</p>
            <button type="button" onClick={() => navigate("/dashboard")} className="mt-4 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
              Browse all jobs
            </button>
          </div>
        )}

        {!isPending && job && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="rounded-2xl bg-white p-8 shadow-sm mb-6">
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {job.isVerified ? "✓ Verified Posting" : "Unverified"}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <h1 className="mb-1 text-3xl font-bold text-foreground">{job.title}</h1>
              <p className="mb-4 font-semibold text-secondary">{job.universityName}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} />{job.category}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} />Full time</span>
              </div>
              <p className="leading-relaxed text-foreground">{job.description}</p>
            </div>

            {/* Application form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              {applied ? (
                <div className="text-center py-6">
                  <div className="mb-4 text-5xl">🎉</div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h2>
                  <p className="text-sm text-muted-foreground mb-6">The university HR team will review your application and be in touch.</p>
                  <button type="button" onClick={() => navigate("/applications")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
                    Track My Applications
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-5 text-xl font-bold text-foreground">Apply for this position</h2>
                  <form onSubmit={handleApply} className="grid gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Your name</span>
                      <input type="text" value={user?.name || ""} readOnly className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground/60 outline-none" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Phone number</span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 9876543210" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Resume / Profile link (optional)</span>
                      <input type="url" value={resume} onChange={(e) => setResume(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                    </label>
                    <button type="submit" disabled={applying} className="mt-1 w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition">
                      {applying ? "Submitting…" : "Submit Application →"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}