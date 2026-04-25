import { API_BASE } from "../../lib/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, ChevronLeft, ChevronRight, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
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

const EXPERIENCE_OPTIONS = ["Any", "Fresher", "1-3 years", "3-5 years", "5+ years"];
const SALARY_MIN_K = 20;
const SALARY_MAX_K = 200;

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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [roleType, setRoleType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [salaryMinK, setSalaryMinK] = useState(20);
  const [salaryMaxK, setSalaryMaxK] = useState(120);

  const [fetchedJobs, setFetchedJobs] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
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
    universityName: j.organizationName || j.hr?.university || j.hr?.name || "Unknown University", 
    category: j.jobType, 
    location: j.location, 
    experience: j.experience || "",
    salaryMinK: typeof j.salaryMinK === "number" ? j.salaryMinK : null,
    salaryMaxK: typeof j.salaryMaxK === "number" ? j.salaryMaxK : null,
    description: j.description, 
    isVerified: true
  })) : FALLBACK_JOBS;

  const locationOptions = [
    "All locations",
    ...Array.from(new Set(allJobs.map((j) => j.location).filter(Boolean))),
  ];

  const filtered = allJobs.filter((j) => {
    const matchCat = !activeFilter || j.category === activeFilter;
    const matchRoleType = !roleType || j.category === roleType;
    const matchLocation = !locationFilter || j.location === locationFilter;
    const matchExperience =
      experienceFilter === "Any" ||
      !j.experience ||
      j.experience === experienceFilter;
    const hasSalaryData = typeof j.salaryMinK === "number" && typeof j.salaryMaxK === "number";
    const matchSalary =
      !hasSalaryData ||
      ((j.salaryMaxK as number) >= salaryMinK && (j.salaryMinK as number) <= salaryMaxK);
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      j.title.toLowerCase().includes(query) ||
      j.universityName.toLowerCase().includes(query);
    return matchCat && matchRoleType && matchLocation && matchExperience && matchSalary && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div
        className={`w-full px-6 py-10 transition-all duration-300 md:px-10 ${
          sidebarCollapsed ? "lg:pl-[118px]" : "lg:pl-[330px]"
        }`}
      >
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                  }
                  if (e.key === "Escape") {
                    setSearchInput("");
                    setSearchQuery("");
                  }
                }}
                placeholder="Search jobs, universities…"
                className="w-full rounded-full border border-border bg-background pl-10 pr-5 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background transition"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        <div>
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close filter sidebar"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black/20 lg:hidden"
            />
          )}

          <aside
            className={`fixed bottom-0 top-16 z-30 border-r border-border bg-white shadow-lg transition-all duration-300 ${
              sidebarOpen ? "left-0" : "-left-[320px]"
            } lg:left-0 ${sidebarCollapsed ? "lg:w-[78px]" : "lg:w-[286px]"}`}
          >
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="absolute -right-4 top-20 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-blue-600 text-white shadow-md transition hover:bg-blue-500 lg:flex"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className="h-full overflow-y-auto">
              <div className={`flex items-center justify-between border-b border-border px-4 py-4 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
                <div className={`flex items-center gap-2 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-white">
                    <Filter size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Filters</p>
                    <p className="text-xs text-muted-foreground">Candidate panel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg border border-border p-1.5 text-foreground/80 transition hover:bg-background lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X size={15} />
                </button>
              </div>

              {sidebarCollapsed ? (
                <div className="hidden h-full flex-col items-center gap-4 pt-6 lg:flex">
                  <span className="rounded-xl border border-border bg-background p-2 text-foreground"><SlidersHorizontal size={16} /></span>
                  <span className="rounded-xl border border-border bg-background p-2 text-foreground"><Filter size={16} /></span>
                  <span className="rounded-xl border border-border bg-background p-2 text-foreground"><MapPin size={16} /></span>
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-5 border-b border-border pb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">All roles</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFilter("");
                          setRoleType("");
                          setLocationFilter("");
                          setExperienceFilter("Any");
                          setSalaryMinK(20);
                          setSalaryMaxK(120);
                        }}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FILTERS.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setActiveFilter(f.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            activeFilter === f.value ? "border-foreground bg-foreground text-white" : "border-border bg-white text-foreground hover:border-foreground/30"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Main filters</p>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role type</span>
                      <select
                        value={roleType}
                        onChange={(e) => setRoleType(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                      >
                        <option value="">All</option>
                        {FILTERS.filter((f) => f.value).map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</span>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                      >
                        {locationOptions.map((location) => (
                          <option
                            key={location}
                            value={location === "All locations" ? "" : location}
                          >
                            {location}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience</span>
                      <select
                        value={experienceFilter}
                        onChange={(e) => setExperienceFilter(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                      >
                        {EXPERIENCE_OPTIONS.map((experience) => (
                          <option key={experience} value={experience}>{experience}</option>
                        ))}
                      </select>
                    </label>

                    <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Range</p>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Salary range</p>
                      <p className="mb-3 text-sm font-medium text-foreground">₹{salaryMinK}k-₹{salaryMaxK >= 100 ? (salaryMaxK / 100).toFixed(1).replace(".0", "") + "L" : `${salaryMaxK}k`}/mo</p>
                      <div className="relative mb-3">
                        <input
                          type="range"
                          min={SALARY_MIN_K}
                          max={SALARY_MAX_K}
                          step={5}
                          value={salaryMinK}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setSalaryMinK(Math.min(next, salaryMaxK - 5));
                          }}
                          className="w-full"
                          aria-label="Minimum salary"
                        />
                        <input
                          type="range"
                          min={SALARY_MIN_K}
                          max={SALARY_MAX_K}
                          step={5}
                          value={salaryMaxK}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setSalaryMaxK(Math.max(next, salaryMinK + 5));
                          }}
                          className="mt-2 w-full"
                          aria-label="Maximum salary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div>
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