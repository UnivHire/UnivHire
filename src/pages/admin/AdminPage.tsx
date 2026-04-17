import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Briefcase, ClipboardList } from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { SmartNavbar } from "../../components/SmartNavbar";

export function AdminPage() {
  const navigate = useNavigate();
  const { data: jobs, isPending: loadJ } = useQuery("JobPosting", { orderBy: { updatedAt: "desc" } });
  const { data: apps } = useQuery("JobApplication");
  const { data: regs } = useQuery("UniversityRegistration");
  const { update } = useMutation("JobPosting");

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <motion.div className="mb-8 rounded-2xl bg-white px-8 py-6 shadow-sm flex items-center justify-between"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-secondary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Platform overview &amp; verification controls</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Briefcase size={20} />, label: "Total Jobs", value: jobs?.length || 0, color: "card-peach" },
            { icon: <Users size={20} />, label: "Applications", value: apps?.length || 0, color: "card-mint" },
            { icon: <ClipboardList size={20} />, label: "University Registrations", value: regs?.length || 0, color: "card-lavender" },
          ].map((s, i) => (
            <motion.div key={s.label} className={`${s.color} flex items-center gap-4 rounded-2xl p-5`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-foreground/60">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Job verification table */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-bold text-foreground">Job Postings — Verification Queue</h2>
          {loadJ ? <div className="h-40 rounded-xl bg-muted animate-pulse" /> : (
            <div className="space-y-3">
              {(jobs || []).map((j) => (
                <div key={j.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.universityName} · {j.location}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${j.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {j.isVerified ? "Verified" : "Pending"}
                  </span>
                  <button type="button"
                    onClick={() => update(j.id, { isVerified: !j.isVerified })}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${j.isVerified ? "border border-red-200 text-red-500 hover:bg-red-50" : "bg-emerald-600 text-white hover:opacity-80"}`}>
                    {j.isVerified ? "Revoke" : "Verify ✓"}
                  </button>
                </div>
              ))}
              {(!jobs || jobs.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">No job postings yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}