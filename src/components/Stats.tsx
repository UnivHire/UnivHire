import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { useQuery } from "@animaapp/playground-react-sdk";

const statMeta = [
  { label: "Universities Targeted", fallback: 500, suffix: "+" },
  { label: "Role Categories", fallback: 20, suffix: "+" },
  { label: "Candidates Goal", fallback: 10000, suffix: "+" },
  { label: "Centralized Platform", fallback: 1, suffix: "" },
];

export function Stats() {
  const { data: registrations } = useQuery("UniversityRegistration", { limit: 500 });
  const { data: jobs } = useQuery("JobPosting", { limit: 500 });
  const { data: applications } = useQuery("JobApplication", { limit: 500 });

  const liveValues = [
    registrations && registrations.length > 0 ? registrations.length : statMeta[0].fallback,
    jobs && jobs.length > 0 ? jobs.length : statMeta[1].fallback,
    applications && applications.length > 0 ? applications.length : statMeta[2].fallback,
    statMeta[3].fallback,
  ];

  return (
    <section className="px-6 py-20 md:px-10" id="stats">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-foreground px-8 py-14 md:px-14">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Built to scale trusted university hiring
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              Designed for verified institutions, role diversity, and clearer candidate pathways — without sacrificing trust.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {statMeta.map((item, index) => (
              <CounterCard
                key={item.label}
                label={item.label}
                value={liveValues[index]}
                suffix={item.suffix}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CounterCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [motionValue, started, value]);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/8 p-6 text-center backdrop-blur-sm">
      <p className="mb-2 text-5xl font-bold text-secondary md:text-6xl">
        {display.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-white/70">{label}</p>
    </div>
  );
}