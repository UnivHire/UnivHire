import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Search, SlidersHorizontal, Bell, Settings, LogOut } from "lucide-react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const PASTEL = ["card-peach","card-mint","card-lavender","card-sky","card-pink","card-cream"];

const FILTERS = [
  { label: "All roles", value: "" },
  { label: "Faculty", value: "Faculty" },
  { label: "Trainer", value: "Trainer" },
  { label: "Driver", value: "Driver" },
  { label: "Security", value: "Security" },
  { label: "Peon", value: "Peon" },
];

const FALLBACK_JOBS = [
  { id: "f1", title: "Assistant Professor — CS", universityName: "North Valley University", category: "Faculty", location: "Delhi", description: "Teach computing subjects.", isVerified: true },
  { id: "f2", title: "Campus Security Supervisor", universityName: "Shivtara University", category: "Security", location: "Lucknow, UP", description: "Coordinate security teams.", isVerified: true },
  { id: "f3", title: "Administrative Driver", universityName: "Maharashtra Central", category: "Driver", location: "Pune, MH", description: "Official transport duties.", isVerified: true },
  { id: "f4", title: "Lab Technician", universityName: "Delhi Science College", category: "Trainer", location: "Delhi", description: "Manage lab equipment.", isVerified: true },
  { id: "f5", title: "Head Groundskeeper", universityName: "Rajasthan Central Uni", category: "Operations", location: "Jaipur", description: "Campus grounds maintenance.", isVerified: true },
  { id: "f6", title: "Senior UX Researcher", universityName: "IIT Affiliated Campus", category: "Faculty", location: "Bangalore", description: "Lead design research.", isVerified: true },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");

  const [fetchedJobs, setFetchedJobs] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setFetchedJobs(data);
        setIsPending(false);
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
        setIsPending(false);
      });
  }, []);

  const allJobs = (!isPending && fetchedJobs.length > 0) ? fetchedJobs.map(j => ({
    id: j.id, 
    title: j.title, 
    universityName: j.hr?.name || "Unknown University", 
    category: j.jobType, 
    location: j.location, 
    description: j.description, 
    isVerified: true
  })) : FALLBACK_JOBS;

  const filtered = allJobs.filter((j) => {
    const matchCat = !activeFilter || j.category === activeFilter;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.universityName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {/* Welcome strip */}
        <motion.div className="mb-8 rounded-2xl bg-white px-8 py-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Candidate"} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here are today&#39;s verified opportunities for you</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate("/applications")} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-background transition">My Applications</button>
            <button type="button" onClick={() => navigate("/saved")} className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-white hover:opacity-80 transition">Saved Jobs</button>
          </div>
        </motion.div>

        {/* Search + filter bar */}
        <div className="mb-6 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, universities…"
                className="w-full rounded-full border border-border bg-background pl-10 pr-5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40 transition"
              />
            </div>
            <button type="button" className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background transition">
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === f.value ? "border-foreground bg-foreground text-white" : "border-border bg-white text-foreground hover:border-foreground/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs heading */}
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Recommended Jobs</h2>
          <span className="rounded-full border border-border bg-white px-3 py-0.5 text-sm font-medium">{filtered.length * 60}+</span>
        </div>

        {/* Job cards grid */}
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job, idx) => (
              <DashboardJobCard key={job.id} job={job} colorClass={PASTEL[idx % PASTEL.length]} index={idx} onDetails={() => navigate(`/jobs/${job.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardJobCard({ job, colorClass, index, onDetails }: { job: { id: string; title: string; universityName: string; category: string; location: string; isVerified: boolean }; colorClass: string; index: number; onDetails: () => void; }) {
  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })}, ${now.getFullYear() - (index % 2)}`;
  const tags = [job.category, "Full time", "Verified"];
  return (
    <motion.article
      className={`${colorClass} flex flex-col justify-between rounded-2xl p-5 transition duration-300 hover:scale-[1.02] hover:shadow-lg`}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-medium text-foreground/60">{dateStr}</span>
        <button aria-label="Bookmark" className="text-foreground/40 hover:text-foreground transition"><Bookmark size={15} /></button>
      </div>
      <p className="mb-0.5 text-xs font-medium text-foreground/60">{job.universityName}</p>
      <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">{job.title}</h3>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-foreground/15 bg-white/60 px-2.5 py-0.5 text-xs font-medium text-foreground">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Open</p>
          <div className="flex items-center gap-1 text-xs text-foreground/50"><MapPin size={11} /><span>{job.location}</span></div>
        </div>
        <button type="button" onClick={onDetails} className="rounded-full bg-foreground px-5 py-2 text-xs font-bold text-white transition hover:opacity-80">Details</button>
      </div>
    </motion.article>
  );
}