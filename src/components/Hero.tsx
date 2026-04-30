import { motion } from "framer-motion";
import { Bookmark, MapPin, ShieldCheck } from "lucide-react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PASTEL_CLASSES = [
  "card-peach",
  "card-mint",
  "card-lavender",
  "card-sky",
  "card-pink",
  "card-cream",
];

const FALLBACK_JOBS = [
  {
    id: "f1",
    title: "Assistant Professor — CS",
    universityName: "North Valley University",
    category: "Faculty",
    location: "Delhi",
    description: "Teach modern computing subjects and mentor students.",
    isVerified: true,
    salary: "INR 70,000 - 95,000 / month",
  },
  {
    id: "f2",
    title: "Campus Security Supervisor",
    universityName: "Shivtara University",
    category: "Security",
    location: "Lucknow, UP",
    description: "Coordinate security teams and maintain campus readiness.",
    isVerified: true,
    salary: "INR 38,000 - 52,000 / month",
  },
  {
    id: "f3",
    title: "Administrative Driver",
    universityName: "Maharashtra Central",
    category: "Driver",
    location: "Pune, MH",
    description: "Official transport duties with institutional compliance.",
    isVerified: true,
    salary: "INR 28,000 - 36,000 / month",
  },
  {
    id: "f4",
    title: "Lab Technician",
    universityName: "Delhi Science College",
    category: "Trainer",
    location: "Delhi",
    description: "Manage laboratory equipment and support practical sessions.",
    isVerified: true,
    salary: "INR 32,000 - 45,000 / month",
  },
  {
    id: "f5",
    title: "Head Groundskeeper",
    universityName: "Rajasthan Central Uni",
    category: "Operations",
    location: "Jaipur, RJ",
    description: "Oversee campus grounds maintenance and beautification.",
    isVerified: true,
    salary: "INR 30,000 - 40,000 / month",
  },
  {
    id: "f6",
    title: "Senior UX Researcher",
    universityName: "IIT Affiliated Campus",
    category: "Faculty",
    location: "Bangalore",
    description: "Lead design research initiatives within the digital lab.",
    isVerified: true,
    salary: "INR 90,000 - 1.2L / month",
  },
];

export function Hero() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { data: jobs, isPending, error } = useQuery("JobPosting", {
    where: { isVerified: true },
    orderBy: { createdAt: "desc" },
    limit: 6,
  });

  const displayJobs =
    !isPending && !error && jobs && jobs.length > 0
      ? jobs.slice(0, 6)
      : FALLBACK_JOBS;

  return (
    <section id="home" className="px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        {/* Content area — white card panel */}
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          {/* Top hero strip inside the white card */}
          <div className="flex flex-col gap-6 border-b border-border px-8 py-8 lg:flex-row lg:items-start lg:gap-10">
            {/* Sidebar promo card */}
            <motion.div
              className="relative order-2 flex-shrink-0 overflow-hidden rounded-2xl bg-[hsl(220,18%,12%)] p-8 text-white w-full lg:ml-auto lg:w-[30rem] lg:p-9"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* decorative circles */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/10" />
              <div className="absolute -right-4 -bottom-10 h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute right-2 bottom-2 h-16 w-16 rounded-full border border-white/10" />
              <p className="relative mb-7 text-2xl font-bold leading-snug text-white lg:text-[2rem]">
                Get Your best<br />profession<br />with <span className="text-secondary">UnivHire</span>
              </p>
              <button
                type="button"
                onClick={() => document.querySelector("#for-candidates")?.scrollIntoView({ behavior: "smooth" })}
                className="relative rounded-full bg-secondary px-8 py-3 text-base font-semibold text-white transition hover:opacity-85"
              >
                Find Jobs
              </button>
            </motion.div>

            {/* Main headline + search area */}
            <div className="order-1 flex-1">
              <motion.div
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ShieldCheck size={13} className="text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Verified hiring for Indian universities
                </span>
              </motion.div>

              <motion.h1
                className="mb-3 text-4xl font-extrabold leading-tight text-foreground md:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                India's First Centralized<br />
                <span className="text-secondary">University Hiring</span> Platform
              </motion.h1>

              <motion.p
                className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                One platform for faculty, trainers, peons, drivers and guards across every university in India. Zero sifarish. Fully verified.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (token) navigate("/dashboard");
                    else navigate("/login?returnUrl=/dashboard");
                  }}
                  className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-80"
              >
                  Browse All Jobs
                </button>
                <button
                  type="button"
                  onClick={() => document.querySelector("#for-universities")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full border border-border bg-white px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background"
                >
                  Register as HR →
                </button>
              </motion.div>
            </div>
          </div>

          {/* Jobs section */}
          <div className="px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">Recommended jobs</h2>
                <span className="rounded-full border border-border px-3 py-0.5 text-sm font-medium text-foreground">
                  {displayJobs.length * 60}+
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sort by:</span>
                <span className="font-semibold text-foreground">Last updated</span>
                <span className="text-muted-foreground">⊞</span>
              </div>
            </div>

            {isPending && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {!isPending && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {displayJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} colorClass={PASTEL_CLASSES[index % PASTEL_CLASSES.length]} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const TAG_COLORS = [
  "bg-white border-border text-foreground",
  "bg-white border-border text-foreground",
];

function JobCard({
  job,
  colorClass,
  index,
}: {
  job: { id: string; title: string; universityName: string; category: string; location: string; description: string; salary?: string };
  colorClass: string;
  index: number;
}) {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const tags = [job.category, "Full time", "Verified"];
  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })}, ${now.getFullYear() - (index % 2)}`;

  const handleDetails = () => {
    if (token) navigate(`/jobs/${job.id}`);
    else navigate(`/login?returnUrl=/jobs/${job.id}`);
  };

  return (
    <motion.article
      className={`${colorClass} interactive-card flex flex-col justify-between rounded-2xl p-5`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-medium text-foreground/60">{dateStr}</span>
        <button aria-label="Bookmark" className="text-foreground/40 hover:text-foreground transition">
          <Bookmark size={15} />
        </button>
      </div>
      <p className="mb-0.5 text-xs font-medium text-foreground/60">{job.universityName}</p>
      <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">{job.title}</h3>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-foreground/15 bg-white/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Open</p>
          <div className="flex items-center gap-1 text-xs text-foreground/50">
            <MapPin size={11} />
            <span>{job.location}</span>
          </div>
          {job.salary ? (
            <p className="mt-1 text-xs font-semibold text-foreground/70">{job.salary}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleDetails}
          className="rounded-full bg-foreground px-5 py-2 text-xs font-bold text-white transition hover:opacity-80"
        >
          Details
        </button>
      </div>
    </motion.article>
  );
}  