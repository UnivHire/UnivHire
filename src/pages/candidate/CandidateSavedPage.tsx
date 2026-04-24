import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { CandidateJobCard } from "../../components/candidate/CandidateJobCard";
import { useCandidateStore } from "../../store/candidateStore";
import { FALLBACK_CANDIDATE_JOBS, normalizeCandidateJob, type CandidateJob } from "../../lib/candidate";

export function CandidateSavedPage() {
  const navigate = useNavigate();
  const { savedJobs, unsaveJob } = useCandidateStore();
  const [search, setSearch] = useState("");
  const [fetchedJobs, setFetchedJobs] = useState<CandidateJob[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setFetchedJobs(Array.isArray(data) ? data.map(normalizeCandidateJob) : []);
      })
      .catch(() => undefined);
  }, []);

  const savedList = useMemo(() => {
    const baseJobs = fetchedJobs.length > 0 ? fetchedJobs : FALLBACK_CANDIDATE_JOBS;
    return Object.values(savedJobs)
      .map((saved) => {
        const liveJob = baseJobs.find((job) => job.id === saved.id);
        return (
          liveJob || {
            id: saved.id,
            title: saved.title,
            universityName: saved.universityName,
            category: saved.jobType,
            location: saved.location,
            description: saved.description,
            isVerified: true,
            status: "OPEN",
          }
        );
      })
      .filter((job) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          job.title.toLowerCase().includes(query) ||
          job.universityName.toLowerCase().includes(query) ||
          job.category.toLowerCase().includes(query)
        );
      });
  }, [fetchedJobs, savedJobs, search]);

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <CandidatePageHeader
          eyebrow="Shortlist"
          title="Saved Jobs"
          description="Keep your strongest opportunities in one place so you can compare and apply with confidence."
          actions={
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Browse more jobs
            </button>
          }
        />

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search within saved jobs"
              className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-5 text-sm text-foreground outline-none focus:border-foreground/40"
            />
          </div>
        </div>

        {savedList.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Your shortlist is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Save promising roles from the dashboard to compare them here before you apply.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Explore verified jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {savedList.map((job, index) => (
              <CandidateJobCard
                key={job.id}
                job={job}
                index={index}
                saved
                onToggleSave={() => unsaveJob(job.id)}
                onOpen={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
