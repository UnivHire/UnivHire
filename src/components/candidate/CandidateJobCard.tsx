import { Bookmark, BookmarkCheck, Building2, MapPin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { CandidateJob } from "../../lib/candidate";
import { formatRelativeDate, formatSalaryDisplay, resolveJobThemeClass } from "../../lib/candidate";

export function CandidateJobCard({
  job,
  index = 0,
  saved,
  onToggleSave,
  onOpen,
}: {
  job: CandidateJob;
  index?: number;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const cardColor = resolveJobThemeClass(job);
  const tags = [
    job.workplaceType ? job.workplaceType.replace("_", "-") : null,
    job.category,
    job.status === "OPEN" ? "Open" : "Closed",
    job.isVerified ? "Verified" : "Review",
  ].filter(Boolean) as string[];

  return (
    <motion.article
      className={`${cardColor} flex h-full flex-col justify-between rounded-2xl p-5 shadow-sm transition duration-300 hover:scale-[1.01] hover:shadow-lg`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {job.organizationLogoUrl ? (
              <img
                src={job.organizationLogoUrl}
                alt={`${job.universityName} logo`}
                className="h-11 w-11 rounded-lg border border-foreground/10 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-foreground/20 bg-white/40 text-foreground/60">
                <Building2 size={15} />
              </div>
            )}

            <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              {formatRelativeDate(job.createdAt)}
            </p>
            <p className="mt-1 text-xs font-medium text-foreground/60">{job.universityName}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={saved ? "Remove saved job" : "Save job"}
            onClick={onToggleSave}
            className={`rounded-full border px-3 py-2 transition ${
              saved
                ? "border-foreground/15 bg-white text-foreground"
                : "border-foreground/10 bg-white/60 text-foreground/50 hover:text-foreground"
            }`}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">{job.title}</h3>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-foreground/10 bg-white/60 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mb-4 line-clamp-3 text-sm leading-6 text-foreground/75">{job.description}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2 text-xs text-foreground/60 sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} />
            <span>{job.isVerified ? "Verified employer" : "Pending verification"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {formatSalaryDisplay(job.salary, job.salaryMinK, job.salaryMaxK)}
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full bg-foreground px-5 py-2 text-xs font-bold text-white transition hover:opacity-80"
          >
            View details
          </button>
        </div>
      </div>
    </motion.article>
  );
}
