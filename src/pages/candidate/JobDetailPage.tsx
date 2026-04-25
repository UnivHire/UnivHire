import { API_BASE } from "../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

function humanizeEnum(value?: string) {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function splitCsv(value?: string) {
  if (!value) return [] as string[];
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}

function parseScreening(value?: string) {
  if (!value) return [] as Array<{ type: string; mustHave?: boolean }>;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [job, setJob] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errorStr, setErrorStr] = useState("");

  const isExternalApply = job?.applicationMode === "EXTERNAL";
  const skills = splitCsv(job?.requiredSkills);
  const jobFunctions = splitCsv(job?.jobFunction);
  const industries = splitCsv(job?.industry);
  const screeningQuestions = parseScreening(job?.screeningQuestions);
  const organizationName = job?.organizationName || job?.hr?.university || job?.hr?.name || "University";

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/jobs/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch job");
        setJob(data);
      } catch {
        setJob(null);
      } finally {
        setIsPending(false);
      }
    };

    loadJob();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;

    if (!resumeFile) {
      if (job?.requireResume) {
        setErrorStr("Please upload your resume in PDF format.");
        return;
      }
    }

    if (resumeFile && resumeFile.type !== "application/pdf") {
      setErrorStr("Resume must be a PDF file.");
      return;
    }

    setApplying(true);
    setErrorStr("");
    try {
      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("candidatePhone", phone);
      formData.append("address", address);
      formData.append("currentLocation", currentLocation);
      formData.append("resume", resumeFile);

      const response = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setApplied(true);
    } catch (err: any) {
      setErrorStr(err.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10 lg:px-12">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to jobs
        </button>

        {isPending && (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isPending && !job && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-muted-foreground">Job not found. It may have been removed.</p>
            <button type="button" onClick={() => navigate("/dashboard")} className="mt-4 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
              Browse all jobs
            </button>
          </div>
        )}

        {!isPending && job && (
          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-peach min-w-0 rounded-2xl p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {job.status === "OPEN" ? "✓ Open Posting" : "Closed"}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <h1 className="mb-1 text-3xl font-bold text-foreground">{job.title}</h1>
              <p className="mb-4 font-semibold text-secondary">{organizationName}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} />{humanizeEnum(job.jobType)}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} />{humanizeEnum(job.workplaceType)}</span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{humanizeEnum(job.jobType)}</span>
                <span className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{humanizeEnum(job.workplaceType)}</span>
                <span className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{humanizeEnum(job.seniorityLevel)}</span>
                <span className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{Math.max(0, Number(job.experienceYears || 0))} year(s) exp</span>
              </div>

              <section className="mb-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Full Description</h3>
                <p className="break-words leading-relaxed text-foreground">{job.description}</p>
              </section>

              {jobFunctions.length > 0 && (
                <section className="mb-5">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Job Functions</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobFunctions.map((item) => (
                      <span key={item} className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{item}</span>
                    ))}
                  </div>
                </section>
              )}

              {industries.length > 0 && (
                <section className="mb-5">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((item) => (
                      <span key={item} className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{item}</span>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section className="mb-5">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((item) => (
                      <span key={item} className="rounded-full border border-foreground/15 bg-white/70 px-3 py-1 text-xs font-medium text-foreground">{item}</span>
                    ))}
                  </div>
                </section>
              )}

              {screeningQuestions.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">HR Screening Questions</h3>
                  <ul className="space-y-2">
                    {screeningQuestions.map((item, idx) => (
                      <li key={`${item.type}-${idx}`} className="rounded-lg border border-foreground/10 bg-white/60 px-3 py-2 text-sm text-foreground">
                        {item.type}
                        {item.mustHave ? <span className="ml-2 text-xs font-semibold text-emerald-700">Must-have</span> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Application form */}
            <div className="min-w-0 rounded-2xl bg-white p-8 shadow-sm">
              {applied ? (
                <div className="text-center py-6">
                  <div className="mb-4 text-5xl">🎉</div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h2>
                  <p className="text-sm text-muted-foreground mb-6">The university HR team will review your application and be in touch.</p>
                  <button type="button" onClick={() => navigate("/applications")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">
                    Track My Applications
                  </button>
                </div>
              ) : isExternalApply ? (
                <div className="py-2">
                  <h2 className="mb-3 text-xl font-bold text-foreground">Apply for this position</h2>
                  <p className="mb-5 text-sm text-muted-foreground">
                    HR has requested applications via an external portal.
                  </p>
                  <a
                    href={job.externalApplyUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white hover:opacity-80 transition"
                  >
                    Apply on External Site
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="mb-5 text-xl font-bold text-foreground">Apply for this position</h2>
                  <form onSubmit={handleApply} className="grid gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Your name</span>
                      <input type="text" value={user?.name || ""} readOnly className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground/60 outline-none" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Phone number</span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 9876543210" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Address</span>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="e.g. 23 MG Road, Delhi" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Current location</span>
                      <input type="text" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} required placeholder="e.g. Mathura, UP" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Resume (PDF only){job?.requireResume ? " *" : " (optional)"}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        required={Boolean(job?.requireResume)}
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="w-full rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                      />
                      {resumeFile && <span className="block truncate text-xs text-muted-foreground">Selected: {resumeFile.name}</span>}
                    </label>
                    <button type="submit" disabled={applying} className="mt-1 w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition">
                      {applying ? "Submitting…" : "Submit Application →"}
                    </button>
                    {errorStr && <p className="text-xs text-red-500">Error: {errorStr}</p>}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}