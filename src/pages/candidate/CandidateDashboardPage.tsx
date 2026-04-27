import { API_BASE } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  MapPin,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useCandidateStore } from "../../store/candidateStore";
import {
  FALLBACK_CANDIDATE_JOBS,
  formatRelativeDate,
  formatSalaryRange,
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
  const { savedJobs, saveJob, unsaveJob, preferences } = useCandidateStore();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleType, setRoleType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [salaryMinK, setSalaryMinK] = useState(preferences.minSalaryK);
  const [salaryMaxK, setSalaryMaxK] = useState(140);
  const [fetchedJobs, setFetchedJobs] = useState<CandidateJob[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
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

  const selectedJob = filtered.find((job) => job.id === selectedJobId) || filtered[0] || null;
  const pageTitle = locationFilter ? `Jobs in ${locationFilter}` : "Browse jobs";

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

      <div className="mx-auto w-full max-w-[1160px] px-4 py-5 md:px-6">
        <section className="mb-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_260px_104px]">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                placeholder="Job title, keyword, or university"
                className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-foreground outline-none focus:border-foreground/40"
              />
            </div>
            <label className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-foreground outline-none focus:border-foreground/40"
              >
                {locationOptions.map((location) => (
                  <option key={location} value={location === "All locations" ? "" : location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setSearchQuery(searchInput)}
              className="h-12 rounded-xl bg-secondary px-5 text-sm font-bold text-white transition hover:opacity-85"
            >
              Search
            </button>
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <InlineFilters
              roleType={roleType}
              onRoleTypeChange={setRoleType}
              experienceFilter={experienceFilter}
              onExperienceChange={setExperienceFilter}
              salaryMinK={salaryMinK}
              salaryMaxK={salaryMaxK}
              onSalaryMinChange={setSalaryMinK}
              onSalaryMaxChange={setSalaryMaxK}
            />
          <div className="flex gap-2">
            {(searchQuery || locationFilter || roleType || experienceFilter !== "Any") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
                >
                  Clear search
                </button>
            )}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
                  >
                    Reset
                  </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[410px_minmax(0,1fr)]">
          <main className="min-w-0">
            <div className="mb-3">
              <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length} verified opening{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            {isPending ? (
              <div className="grid gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-36 rounded-2xl bg-muted animate-pulse" />
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
              <div className="grid gap-3">
                {filtered.map((job, index) => {
                  const isSaved = Boolean(savedJobs[job.id]);
                  return (
                    <JobListItem
                      key={job.id}
                      job={job}
                      index={index}
                      saved={isSaved}
                      selected={selectedJob?.id === job.id}
                      onToggleSave={() =>
                        isSaved ? unsaveJob(job.id) : saveJob(toSavedJobRecord(job))
                      }
                      onSelect={() => setSelectedJobId(job.id)}
                    />
                  );
                })}
              </div>
            )}
          </main>

          <aside className="min-w-0">
            <JobPreview
              job={selectedJob}
              saved={selectedJob ? Boolean(savedJobs[selectedJob.id]) : false}
              onToggleSave={() => {
                if (!selectedJob) return;
                Boolean(savedJobs[selectedJob.id])
                  ? unsaveJob(selectedJob.id)
                  : saveJob(toSavedJobRecord(selectedJob));
              }}
              onOpen={() => selectedJob && navigate(`/jobs/${selectedJob.id}`)}
              onUpdateProfile={() => navigate("/profile")}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function InlineFilters({
  roleType,
  onRoleTypeChange,
  experienceFilter,
  onExperienceChange,
  salaryMinK,
  salaryMaxK,
  onSalaryMinChange,
  onSalaryMaxChange,
}: {
  roleType: string;
  onRoleTypeChange: (value: string) => void;
  experienceFilter: string;
  onExperienceChange: (value: string) => void;
  salaryMinK: number;
  salaryMaxK: number;
  onSalaryMinChange: (value: number) => void;
  onSalaryMaxChange: (value: number) => void;
}) {
  const salaryLabel = `INR ${salaryMinK}k - ${
    salaryMaxK >= 100 ? `${(salaryMaxK / 100).toFixed(1).replace(".0", "")}L` : `${salaryMaxK}k`
  }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={roleType}
        onChange={(e) => onRoleTypeChange(e.target.value)}
        className="h-8 rounded-full border border-border bg-white px-3 text-xs font-semibold text-foreground outline-none focus:border-foreground/40"
        aria-label="Role filter"
      >
        {FILTERS.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
      <select
        value={experienceFilter}
        onChange={(e) => onExperienceChange(e.target.value)}
        className="h-8 rounded-full border border-border bg-white px-3 text-xs font-semibold text-foreground outline-none focus:border-foreground/40"
        aria-label="Experience filter"
      >
        {EXPERIENCE_OPTIONS.map((experience) => (
          <option key={experience} value={experience}>
            {experience === "Any" ? "Experience" : experience}
          </option>
        ))}
      </select>
      <div className="flex h-8 items-center gap-2 rounded-full border border-border bg-white px-3 text-xs font-semibold text-foreground">
        <span className="hidden sm:inline">{salaryLabel}</span>
        <input
          type="range"
          min={SALARY_MIN_K}
          max={SALARY_MAX_K}
          step={5}
          value={salaryMinK}
          onChange={(e) => {
            const next = Number(e.target.value);
            onSalaryMinChange(Math.min(next, salaryMaxK - 5));
          }}
          className="w-20"
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
            onSalaryMaxChange(Math.max(next, salaryMinK + 5));
          }}
          className="w-20"
          aria-label="Maximum salary"
        />
      </div>
    </div>
  );
}

function JobListItem({
  job,
  index,
  saved,
  selected,
  onToggleSave,
  onSelect,
}: {
  job: CandidateJob;
  index: number;
  saved: boolean;
  selected: boolean;
  onToggleSave: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.article
      className={`rounded-xl border bg-white p-4 transition hover:border-foreground/20 hover:shadow-sm ${
        selected ? "border-foreground ring-2 ring-foreground/10" : "border-border"
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start gap-3">
          <Logo job={job} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-foreground">{job.title}</h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">{job.universityName}</p>
              </div>
              <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-foreground">
                {job.isVerified ? "Verified" : "Review"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {formatRelativeDate(job.createdAt)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-5 text-foreground/70">{job.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[job.category, job.workplaceType?.replace("_", "-"), job.experience || null]
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground/70">
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-foreground/60">
          {formatSalaryRange(job.salaryMinK, job.salaryMaxK)}
        </p>
        <button
          type="button"
          onClick={onToggleSave}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-background"
        >
          {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.article>
  );
}

function JobPreview({
  job,
  saved,
  onToggleSave,
  onOpen,
  onUpdateProfile,
}: {
  job: CandidateJob | null;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
  onUpdateProfile: () => void;
}) {
  if (!job) {
    return (
      <div className="sticky top-24 rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
          <Briefcase size={18} />
        </div>
        <h3 className="text-lg font-bold text-foreground">Select a job</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose a role from the list to preview details without leaving browse.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-white">
      <section className="border-b border-border bg-white p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-foreground">{job.universityName}</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground">{job.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-foreground/70">
              <span className="rounded-md bg-background px-2.5 py-1">{job.location}</span>
              <span className="rounded-md bg-background px-2.5 py-1">
                {formatSalaryRange(job.salaryMinK, job.salaryMaxK)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-foreground transition hover:bg-muted"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:opacity-85"
          >
            <span className="text-secondary">⚡</span>
            Easy Apply
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-background"
            aria-label={saved ? "Remove saved job" : "Save job"}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </section>

      <div className="p-6 pb-60">
        <section className="mb-6 border-b border-border pb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-foreground">Your qualifications for this job</h3>
            <button
              type="button"
              onClick={onUpdateProfile}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition hover:text-secondary"
            >
              <Edit3 size={13} />
              Edit
            </button>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <QualificationItem label={job.experience || "Relevant experience"} />
            <QualificationItem label={job.requiredSkills?.[0] || "Communication"} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-bold text-foreground">Do you also have these qualifications?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(job.requiredSkills && job.requiredSkills.length > 0
                ? job.requiredSkills.slice(0, 4)
                : [job.category, "Campus coordination", "Student support", "Documentation"]
              ).map((skill) => (
                <QualificationChoice key={skill} label={skill} />
              ))}
            </div>
            <button type="button" className="mt-4 text-sm font-bold text-secondary">
              Show more
            </button>
          </div>
        </section>

        <section className="mb-6 border-b border-border pb-6">
          <p className="mb-4 text-sm leading-6 text-foreground/80">
            <span className="font-bold">*Immediate Hiring - {job.title}*</span>
            <br />
            <span className="font-bold">*Location:* {job.location}</span>
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{job.description}</p>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
            <p>
              <span className="font-bold text-foreground">Eligibility Criteria:</span>{" "}
              {job.experience || (job.experienceYears ? `${job.experienceYears}+ years` : "Relevant campus experience preferred")}
            </p>
            <p>
              <span className="font-bold text-foreground">Workplace:</span>{" "}
              {job.workplaceType?.replace("_", "-") || "Campus role"}
            </p>
            <p>
              <span className="font-bold text-foreground">Status:</span>{" "}
              {job.status === "OPEN" ? "Open" : job.status || "Open"}
            </p>
          </div>
          <button type="button" className="mt-5 text-sm font-bold text-secondary">
            Show more
          </button>
        </section>

        <section className="mb-6 border-b border-border pb-6">
          <h3 className="mb-4 text-xl font-bold text-foreground">Base pay range</h3>
          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-2xl font-bold text-secondary">{formatSalaryRange(job.salaryMinK, job.salaryMaxK)}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{job.location}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Employer provided salary information. Actual pay may vary by experience, department, and university policy.
            </p>
          </div>
        </section>

        {job.requiredSkills && job.requiredSkills.length > 0 ? (
          <section className="mb-6 border-b border-border pb-6">
            <h3 className="mb-3 text-lg font-bold text-foreground">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.slice(0, 6).map((skill) => (
                <span key={skill} className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-6">
          <h3 className="text-xl font-bold text-foreground">Conversations @{job.universityName}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ask about salaries, interviews, culture, and anything else related to this university.
          </p>
          <div className="mt-4 rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-bold text-foreground">See what other candidates are saying</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ConversationCard title="Interview Tips" />
              <ConversationCard title="Salary Negotiations" />
            </div>
            <button type="button" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-secondary">
              Explore more conversations <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:opacity-85"
          >
            View full details
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className="rounded-lg border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:bg-background"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QualificationItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
      <CheckCircle2 size={15} className="text-secondary" />
      <span>{label}</span>
    </div>
  );
}

function QualificationChoice({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground">
        <CheckCircle2 size={14} />
      </button>
      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground">
        <X size={14} />
      </button>
      <span>{label}</span>
    </div>
  );
}

function ConversationCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-mint text-foreground">
        <Building2 size={16} />
      </div>
      <p className="font-bold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">8L members</p>
    </div>
  );
}

function Logo({ job, large = false }: { job: CandidateJob; large?: boolean }) {
  const size = large ? "h-14 w-14 rounded-2xl" : "h-12 w-12 rounded-xl";

  if (job.organizationLogoUrl) {
    return (
      <img
        src={job.organizationLogoUrl}
        alt={`${job.universityName} logo`}
        className={`${size} shrink-0 border border-border object-cover`}
      />
    );
  }

  return (
    <div className={`${size} flex shrink-0 items-center justify-center border border-border bg-background text-muted-foreground`}>
      <Building2 size={large ? 20 : 16} />
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-foreground">{value}</p>
    </div>
  );
}
