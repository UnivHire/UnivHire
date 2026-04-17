import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const problems = [
  "Job posts scattered across disconnected websites and notice boards",
  "Candidates struggle to verify whether openings are authentic",
  "HR teams repeat manual outreach for every category of role",
  "Non-teaching opportunities remain hard to discover fairly",
];

const solutions = [
  "Centralized listing system for faculty, trainers and operational roles",
  "Verified job badges that build candidate confidence immediately",
  "One platform for registrations, postings and applications",
  "Inclusive design that supports broad access across all regions",
];

export function ProblemSolution() {
  return (
    <section className="section-shell bg-background">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-2xl">
          <h2 className="section-title">From fragmented hiring to one credible flow</h2>
          <p className="section-copy mt-3">
            UnivHire replaces scattered recruitment with a trusted hiring layer built for India&#39;s higher education ecosystem.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <motion.div
            className="rounded-2xl border border-border bg-white p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35 }}
          >
            <span className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The Problem
            </span>
            <h3 className="mb-6 text-2xl font-bold text-foreground">Hiring today feels inconsistent and opaque</h3>
            <div className="space-y-4">
              {problems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <XCircle size={20} className="mt-0.5 shrink-0 text-warning" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-secondary/30 bg-secondary/8 p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <span className="mb-4 inline-block rounded-full border border-secondary/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              The Solution
            </span>
            <h3 className="mb-6 text-2xl font-bold text-foreground">One transparent platform for every stakeholder</h3>
            <div className="space-y-4">
              {solutions.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-secondary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}