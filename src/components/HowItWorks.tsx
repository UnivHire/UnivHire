import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, FileText, Search, User, BookOpen } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";

const universitySteps = [
  { title: "Register your institution", description: "Share HR contact details and create a trusted presence for your university.", icon: Building2 },
  { title: "Post verified openings", description: "Publish faculty, trainer and non-teaching roles from one central workspace.", icon: FileText },
  { title: "Review applications", description: "Track candidate interest clearly with a structured status workflow.", icon: BookOpen },
  { title: "Hire with confidence", description: "Shortlist faster using a system built around clarity and verified demand.", icon: CheckCircle2 },
];

const candidateSteps = [
  { title: "Browse verified roles", description: "Search authentic jobs across universities without jumping between portals.", icon: Search },
  { title: "Choose the right category", description: "Find openings for faculty, security, drivers, peons, trainers and more.", icon: User },
  { title: "Apply with simple details", description: "Submit your name, phone and resume link in a clear straightforward form.", icon: FileText },
  { title: "Track hiring progress", description: "Stay updated as your application moves from pending to shortlist or hire.", icon: CheckCircle2 },
];

export function HowItWorks() {
  const [tab, setTab] = useState("universities");
  const steps = tab === "universities" ? universitySteps : candidateSteps;

  return (
    <section id="how-it-works" className="section-shell">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-2xl">
          <h2 className="section-title">How it works for every side of hiring</h2>
          <p className="section-copy mt-3">
            One system, two clear journeys — keeping the experience distinct for institutions and candidates.
          </p>
        </div>

        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="mb-8 inline-flex rounded-full border border-border bg-white p-1.5">
            <Tabs.Trigger
              value="universities"
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-all data-[state=active]:bg-foreground data-[state=active]:text-white"
            >
              For Universities
            </Tabs.Trigger>
            <Tabs.Trigger
              value="candidates"
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-all data-[state=active]:bg-foreground data-[state=active]:text-white"
            >
              For Candidates
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="universities" id="for-universities">
            <StepGrid steps={steps} />
          </Tabs.Content>
          <Tabs.Content value="candidates" id="for-candidates">
            <StepGrid steps={steps} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}

function StepGrid({ steps }: { steps: { title: string; description: string; icon: React.ComponentType<{ size: number; className?: string }> }[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.article
            key={step.title}
            className="rounded-2xl border border-border bg-white p-6 interactive-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
          >
            <div className="mb-4 inline-flex rounded-xl bg-secondary/12 p-3">
              <Icon size={22} className="text-secondary" />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {index + 1}</p>
            <h3 className="mb-2 text-base font-bold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
}