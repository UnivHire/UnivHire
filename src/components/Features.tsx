import { motion } from "framer-motion";
import { Bell, Building2, CheckCircle2, Globe, ShieldCheck, Sparkles, Users } from "lucide-react";

const featureCards = [
  { title: "Verified hiring layer", description: "Every listing carries verification signals that reduce uncertainty and improve platform trust.", icon: ShieldCheck, className: "md:col-span-3 md:row-span-2" },
  { title: "Built for many role types", description: "From professor roles to campus operations — categories stay visible and easy to filter.", icon: Building2, className: "md:col-span-3" },
  { title: "Inclusive discovery", description: "Clear language and structured info support broader access across all regions.", icon: Globe, className: "md:col-span-2" },
  { title: "Status tracking", description: "Candidates and HR teams follow progress with simple, legible statuses.", icon: Bell, className: "md:col-span-2" },
  { title: "Single source of truth", description: "Universities publish once instead of managing fragmented notices.", icon: CheckCircle2, className: "md:col-span-2" },
  { title: "Trust-led onboarding", description: "Registration flows create better confidence for both sides of hiring.", icon: Users, className: "md:col-span-3" },
  { title: "Premium platform feel", description: "A refined experience that matches institutional credibility and modern expectations.", icon: Sparkles, className: "md:col-span-3" },
];

export function Features() {
  return (
    <section className="section-shell bg-white">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-2xl">
          <h2 className="section-title">Feature architecture built for trust and clarity</h2>
          <p className="section-copy mt-3">
            Luxury in interface, discipline in information. UniHire balances prestige with practical hiring workflows.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-6">
          {featureCards.map((f, index) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className={`${f.className} interactive-card`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <div className="h-full rounded-2xl border border-border bg-background p-6">
                  <div className="mb-5 inline-flex rounded-xl bg-foreground/8 p-3">
                    <Icon size={22} className="text-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}