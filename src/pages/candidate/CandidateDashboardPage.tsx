import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidateJobCard } from "../../components/candidate/CandidateJobCard";
import { useAuthStore } from "../../store/authStore";
import { useCandidateStore } from "../../store/candidateStore";
import {
  FALLBACK_CANDIDATE_JOBS,
  normalizeCandidateJob,
  toSavedJobRecord,
  type CandidateJob,
} from "../../lib/candidate";

const FILTERS = [
  { label: "All roles", value: "" },
  { label: "Faculty", value: "Faculty" },
  { label: "Trainer", value: "Trainer" },
  { label: "Driver", value: "Driver" },
  { label: "Security", value: "Security" },
  { label: "Operations", value: "Operations" },
];

const EXPERIENCE_OPTIONS = ["Any", "Fresher", "1-3 years", "3-5 years", "5+ years"];
const SALARY_MIN_K = 20;
const SALARY_MAX_K = 200;

export function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { savedJobs, saveJob, unsaveJob, profile, preferences, syncFromAuth } = useCandidateStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleType, setRoleType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [salaryMinK, setSalaryMinK] = useState(preferences.minSalaryK);
  const [salaryMaxK, setSalaryMaxK] = useState(140);
  const [fetchedJobs, setFetchedJobs] = useState<CandidateJob[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    syncFromAuth(user || null);
  }, [syncFromAuth, user]);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setFetchedJobs(Array.isArray(data) ? data.map(normalizeCandidateJob) : []);
        setIsPending(false);
      })
      .catch(() => {
        setIsPending(false);
      });
  }, []);

  const allJobs = !isPending && fetchedJobs.length > 0 ? fetchedJobs : FALLBACK_CANDIDATE_JOBS;

  const locationOptions = useMemo(
    () => ["All locations", ...Array.from(new Set(allJobs.map((job) => job.location).filter(Boolean)))],
    [allJobs]
  );

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      const matchRole = !roleType || job.category === roleType;
      const matchLocation = !locationFilter || job.location === locationFilter;
      const matchExperience =
        experienceFilter === "Any" || !job.experience || job.experience === experienceFilter;
      const hasSalaryData =
        typeof job.salaryMinK === "number" && typeof job.salaryMaxK === "number";
      const matchSalary =
        !hasSalaryData || ((job.salaryMaxK as number) >= salaryMinK && (job.salaryMinK as number) <= salaryMaxK);
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.universityName.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query);

      return matchRole && matchLocation && matchExperience && matchSalary && matchSearch;
    });
  }, [allJobs, experienceFilter, locationFilter, roleType, salaryMaxK, salaryMinK, searchQuery]);

  const stats = [
    { icon: <Briefcase size={18} />, label: "Roles matched", value: filtered.length, tone: "card-peach" },
    { icon: <Sparkles size={18} />, label: "Saved jobs", value: Object.keys(savedJobs).length, tone: "card-mint" },
    { icon: <MapPin size={18} />, label: "Preferred city", value: profile.location.split(",")[0] || "India", tone: "card-lavender" },
    { icon: <Target size={18} />, label: "Target role", value: profile.preferredRole || "Faculty", tone: "card-sky" },
  ];

  const resetFilters = () => {
    setRoleType("");
    setLocationFilter("");
    setExperienceFilter("Any");
    setSalaryMinK(preferences.minSalaryK);
    setSalaryMaxK(140);
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <motion.section
          className="mb-8 overflow-hidden rounded-[28px] bg-foreground px-6 py-7 text-white shadow-sm md:px-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative">
            <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute left-1/3 top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  Candidate Workspace
                </p>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  <span className="text-white">Welcome back, </span>
                  <span className="text-secondary">
                    {user?.name?.split(" ")[0] || "Candidate"}
                  </span>
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Browse verified openings, save the ones worth revisiting, and keep your
                  applications organized in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/applications")}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  My applications
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/saved")}
                  className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Saved jobs
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`${stat.tone} rounded-2xl p-5 shadow-sm`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/65 text-foreground">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchQuery(searchInput);
                  if (e.key === "Escape") {
                    setSearchInput("");
                    setSearchQuery("");
                  }
                }}
                placeholder="Search by role, category, or university"
                className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-5 text-sm text-foreground outline-none focus:border-foreground/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            <button
              type="button"
              onClick={() => setSearchQuery(searchInput)}
              className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Search jobs
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-[300px] border-r border-border bg-white p-5 shadow-xl transition lg:static lg:w-auto lg:rounded-2xl lg:border lg:shadow-sm ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="mb-5 flex items-center justify-between lg:mb-6">
              <div>
                <p className="text-sm font-bold text-foreground">Smart Filters</p>
                <p className="text-xs text-muted-foreground">Tune recommendations to your needs</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-background lg:hidden"
                aria-label="Close filters"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Top roles
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-secondary transition hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setRoleType(filter.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        roleType === filter.value
                          ? "border-foreground bg-foreground text-white"
                          : "border-border bg-background text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Location
                </span>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40"
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location === "All locations" ? "" : location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience
                </span>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40"
                >
                  {EXPERIENCE_OPTIONS.map((experience) => (
                    <option key={experience} value={experience}>
                      {experience}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Salary range
                </p>
                <p className="mb-3 text-sm font-medium text-foreground">
                  INR {salaryMinK}k - {salaryMaxK >= 100 ? `${(salaryMaxK / 100).toFixed(1).replace(".0", "")}L` : `${salaryMaxK}k`}
                </p>
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
                  className="mt-3 w-full"
                />
              </div>

              <div className="rounded-2xl bg-foreground p-4 text-white">
                <p className="text-sm font-semibold">Candidate profile match</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Based on your target role, location, and current preferences.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary"
                >
                  Update my profile <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </aside>

          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/25 lg:hidden"
              aria-label="Close filter overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main className="min-w-0">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Browse verified jobs</h2>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} roles match your current search and filter setup.
                </p>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
                >
                  Clear search
                </button>
              )}
            </div>

            {isPending ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-72 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-lg font-bold text-foreground">No jobs match those filters yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try broadening your role, location, or salary range to uncover more verified openings.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((job, index) => {
                  const isSaved = Boolean(savedJobs[job.id]);
                  return (
                    <CandidateJobCard
                      key={job.id}
                      job={job}
                      index={index}
                      saved={isSaved}
                      onToggleSave={() =>
                        isSaved ? unsaveJob(job.id) : saveJob(toSavedJobRecord(job))
                      }
                      onOpen={() => navigate(`/jobs/${job.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
