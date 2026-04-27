import { API_BASE } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";
import { useCandidateStore } from "../../store/candidateStore";
import {
  FALLBACK_CANDIDATE_JOBS,
  formatSalaryRange,
  normalizeCandidateJob,
  resolveJobThemeClass,
  toSavedJobRecord,
  type CandidateJob,
} from "../../lib/candidate";

export function CandidateJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { savedJobs, saveJob, unsaveJob } = useCandidateStore();

  const [job, setJob] = useState<CandidateJob | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, "" | "YES" | "NO">>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errorStr, setErrorStr] = useState("");

  useEffect(() => {
    const fallback = FALLBACK_CANDIDATE_JOBS.find((item) => item.id === id) || null;

    fetch(`${API_BASE}/api/jobs/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch job");
        setJob(normalizeCandidateJob(data));
        setIsPending(false);
      })
      .catch(() => {
        setJob(fallback);
        setIsPending(false);
      });
  }, [id]);

  const isSaved = useMemo(() => (job ? Boolean(savedJobs[job.id]) : false), [job, savedJobs]);
  const themeClass = job ? resolveJobThemeClass(job) : "card-peach";

  useEffect(() => {
    if (!job?.screeningQuestions || job.screeningQuestions.length === 0) {
      setScreeningAnswers({});
      return;
    }

    setScreeningAnswers((prev) => {
      const next: Record<string, "" | "YES" | "NO"> = {};
      for (const q of job.screeningQuestions || []) {
        const key = String(q.type || "");
        if (!key) continue;
        next[key] = prev[key] || "";
      }
      return next;
    });
  }, [job]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;
    if (!resumeFile) {
      setErrorStr("Please upload your resume in PDF format.");
      return;
    }
    if (resumeFile.type !== "application/pdf") {
      setErrorStr("Resume must be a PDF file.");
      return;
    }

    if (!experienceYears.trim()) {
      setErrorStr("Please enter your total experience.");
      return;
    }

    if (job?.screeningQuestions && job.screeningQuestions.length > 0) {
      const missing = job.screeningQuestions.find((q) => !screeningAnswers[q.type]);
      if (missing) {
        setErrorStr("Please answer all screening questions.");
        return;
      }
    }

    setApplying(true);
    setErrorStr("");
    try {
      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("candidatePhone", phone);
      formData.append("address", address);
      formData.append("currentLocation", currentLocation);
      formData.append("experienceYears", experienceYears);
      formData.append("screeningAnswers", JSON.stringify(screeningAnswers));
      formData.append("resume", resumeFile);

      const response = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit application");
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

      <div className="w-full px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {isPending ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <div className="h-[420px] rounded-2xl bg-muted animate-pulse" />
            <div className="h-[420px] rounded-2xl bg-muted animate-pulse" />
          </div>
        ) : !job ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Job not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This role may have been removed or is no longer available.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Browse other jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <motion.section
              className={`${themeClass} rounded-[28px] p-8 shadow-sm`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {job.status === "OPEN" ? "Open role" : "Closed role"}
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      {job.category}
                    </span>
                    <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold text-foreground/70">
                      Verified listing
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
                  <div className="mt-2 flex items-center gap-2">
                    {job.organizationLogoUrl ? (
                      <img
                        src={job.organizationLogoUrl}
                        alt={`${job.universityName} logo`}
                        className="h-7 w-7 rounded-md border border-foreground/15 object-cover"
                      />
                    ) : null}
                    <p className="text-sm font-semibold text-secondary">{job.universityName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    isSaved ? unsaveJob(job.id) : saveJob(toSavedJobRecord(job))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
                >
                  {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  {isSaved ? "Saved" : "Save job"}
                </button>
              </div>

              <div className="mb-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Role type
                  </p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Briefcase size={14} />
                    <span>{job.category}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Compensation
                  </p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Sparkles size={14} />
                    <span>{formatSalaryRange(job.salaryMinK, job.salaryMaxK)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    About this role
                  </h2>
                  <p className="leading-7 text-foreground/80">{job.description}</p>
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Role details
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.workplaceType ? <Tag>{job.workplaceType.replaceAll("_", "-")}</Tag> : null}
                    {job.seniorityLevel ? <Tag>{job.seniorityLevel.replaceAll("_", "-")}</Tag> : null}
                    {typeof job.experienceYears === "number" && job.experienceYears > 0 ? <Tag>{`Min ${job.experienceYears} yrs experience`}</Tag> : null}
                    {job.applicationMode ? <Tag>{job.applicationMode === "EXTERNAL" ? "External apply" : "Apply on platform"}</Tag> : null}
                    {job.requireResume ? <Tag>Resume required</Tag> : null}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Required skills
                  </h2>
                  {job.requiredSkills && job.requiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => <Tag key={skill}>{skill}</Tag>)}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/70">No specific skills listed by recruiter.</p>
                  )}
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended industries
                  </h2>
                  {job.industries && job.industries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.industries.map((industry) => <Tag key={industry}>{industry}</Tag>)}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/70">No industries mentioned for this role.</p>
                  )}
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Job functions
                  </h2>
                  {job.jobFunctions && job.jobFunctions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.jobFunctions.map((fn) => <Tag key={fn}>{fn}</Tag>)}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/70">No job functions listed.</p>
                  )}
                </section>

                {job.screeningQuestions && job.screeningQuestions.length > 0 ? (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Screening questions
                    </h2>
                    <div className="space-y-2">
                      {job.screeningQuestions.map((q, idx) => (
                        <div key={`${q.type}-${idx}`} className="rounded-2xl bg-background px-4 py-3 text-sm text-foreground/80">
                          <span>{q.type}</span>
                          {q.mustHave ? <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Must-have</span> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {job.applicationMode === "EXTERNAL" && job.externalApplyUrl ? (
                  <section>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      External application link
                    </h2>
                    <a
                      href={job.externalApplyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
                    >
                      Open external apply page
                    </a>
                  </section>
                ) : null}

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Why candidates save this role
                  </h2>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      "Verified university posting with clear ownership.",
                      "Simple, centralized application flow with resume upload.",
                      "Easy to compare with other shortlisted jobs before applying.",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-background px-4 py-4 text-sm text-foreground/75">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-foreground">
                          <ShieldCheck size={15} />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.section>

            <motion.aside
              className="rounded-[28px] bg-white p-8 shadow-sm"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              {applied ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Application submitted</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The hiring team will review your application and update your status in the
                    applications panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/applications")}
                    className="mt-5 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
                  >
                    Track my applications
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">Apply for this role</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Share your current details so the university team can review your profile quickly.
                  </p>

                  <form onSubmit={handleApply} className="mt-6 grid gap-4">
                    <Field label="Full name" value={user?.name || ""} readOnly />
                    <Field
                      label="Phone number"
                      value={phone}
                      onChange={setPhone}
                      placeholder="+91 98765 43210"
                    />
                    <Field
                      label="Address"
                      value={address}
                      onChange={setAddress}
                      placeholder="House no., locality, city"
                    />
                    <Field
                      label="Current location"
                      value={currentLocation}
                      onChange={setCurrentLocation}
                      placeholder="Delhi, India"
                    />

                    <Field
                      label="Total experience (years)"
                      value={experienceYears}
                      onChange={setExperienceYears}
                      placeholder={typeof job.experienceYears === "number" && job.experienceYears > 0 ? `Minimum ${job.experienceYears} years required` : "e.g. 2"}
                    />

                    {job.screeningQuestions && job.screeningQuestions.length > 0 ? (
                      <div className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Screening questions
                        </span>
                        {job.screeningQuestions.map((q, idx) => (
                          <label key={`${q.type}-${idx}`} className="grid gap-1.5">
                            <span className="text-xs font-medium text-foreground">
                              {q.type}
                              {q.mustHave ? <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Must-have</span> : null}
                            </span>
                            <select
                              value={screeningAnswers[q.type] || ""}
                              onChange={(e) =>
                                setScreeningAnswers((prev) => ({
                                  ...prev,
                                  [q.type]: e.target.value as "" | "YES" | "NO",
                                }))
                              }
                              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                            >
                              <option value="">Select answer</option>
                              <option value="YES">Yes</option>
                              <option value="NO">No</option>
                            </select>
                          </label>
                        ))}
                      </div>
                    ) : null}

                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Resume (PDF only)
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        required
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                      />
                    </label>

                    {errorStr ? <p className="text-sm text-red-500">{errorStr}</p> : null}

                    <button
                      type="submit"
                      disabled={applying}
                      className="rounded-full bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-60"
                    >
                      {applying ? "Submitting..." : "Submit application"}
                    </button>
                  </form>
                </>
              )}
            </motion.aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground">{children}</span>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        required={!readOnly}
        placeholder={placeholder}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
      />
    </label>
  );
}
