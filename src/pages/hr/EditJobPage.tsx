import { API_BASE, apiFetch } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Mail, ExternalLink, MapPin, Plus, X } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const EMPLOYMENT_TYPES = [
  { v: "FULL_TIME", l: "Full-time" },
  { v: "PART_TIME", l: "Part-time" },
  { v: "CONTRACT", l: "Contract" },
  { v: "INTERNSHIP", l: "Internship" },
  { v: "TEMPORARY", l: "Temporary" },
];

const WORKPLACE_TYPES = [
  { v: "ON_SITE", l: "On-site" },
  { v: "REMOTE", l: "Remote" },
  { v: "HYBRID", l: "Hybrid" },
];

const SENIORITY = [
  { v: "NOT_APPLICABLE", l: "Not Applicable" },
  { v: "INTERNSHIP", l: "Internship" },
  { v: "ENTRY", l: "Entry level" },
  { v: "ASSOCIATE", l: "Associate" },
  { v: "MID_SENIOR", l: "Mid-Senior level" },
  { v: "DIRECTOR", l: "Director" },
  { v: "EXECUTIVE", l: "Executive" },
];

const JOB_FUNCTIONS = [
  "Administrative", "Education", "Research", "Engineering", "Finance",
  "Human Resources", "Information Technology", "Management", "Marketing", "Operations", "Other",
];

const INDUSTRIES = [
  "Higher Education", "Education Administration Programs", "Primary/Secondary Education",
  "Government Administration", "Non-profit Organizations", "Research Services",
  "Information Technology", "Healthcare", "Other",
];

const RECOMMENDED_SKILLS = [
  "Microsoft Office", "Microsoft Excel", "Microsoft Outlook", "Microsoft PowerPoint",
  "Communication", "Office Software", "Phone Etiquette", "Inventory Control",
  "Office Equipment", "Control System", "Leadership", "Problem Solving",
  "Teamwork", "Time Management", "Research", "Data Analysis",
];

const SCREENING_OPTIONS = [
  "Background Check", "Driver's License", "Drug Test", "Education",
  "Industry Experience", "Language", "Hybrid Work", "Remote Work",
  "Onsite Work", "Work Experience", "Work Authorization", "Visa Status", "Urgent Hiring Need",
];


const inp = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition";

type ScreeningQ = { type: string; mustHave: boolean };

interface FormState {
  title: string;
  universityName: string;
  location: string;
  workplaceType: string;
  employmentType: string;
  seniorityLevel: string;
  jobFunctions: string[];
  industries: string[];
  descriptionSummary: string;
  responsibilities: string;
  qualifications: string;
  skills: string[];
  skillInput: string;
  experienceYears: number;
  applicantMode: "email" | "external";
  applicantEmail: string;
  requireResume: boolean;
  externalUrl: string;
  screeningQuestions: ScreeningQ[];
  status: "OPEN" | "CLOSED";
}

const INIT: FormState = {
  title: "",
  universityName: "",
  location: "",
  workplaceType: "ON_SITE",
  employmentType: "FULL_TIME",
  seniorityLevel: "NOT_APPLICABLE",
  jobFunctions: [],
  industries: [],
  descriptionSummary: "",
  responsibilities: "",
  qualifications: "",
  skills: [],
  skillInput: "",
  experienceYears: 0,
  applicantMode: "email",
  applicantEmail: "",
  requireResume: true,
  externalUrl: "",
  screeningQuestions: [],
  status: "OPEN",
};

function splitCsv(raw: unknown): string[] {
  return String(raw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseScreening(raw: unknown): ScreeningQ[] {
  if (!raw) return [];
  const source = String(raw).trim();
  if (!source) return [];
  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((q: any) => ({ type: String(q?.type || "").trim(), mustHave: Boolean(q?.mustHave) }))
      .filter((q) => q.type);
  } catch {
    return [];
  }
}

function splitJobDescription(raw: unknown) {
  const source = String(raw || "").trim();
  if (!source) return { descriptionSummary: "", responsibilities: "", qualifications: "" };

  const respRegex = /\bkey responsibilities\s*:\s*/i;
  const qualRegex = /\bqualifications\s*:\s*/i;

  const respIndex = source.search(respRegex);
  const qualIndex = source.search(qualRegex);

  let descriptionSummary = source;
  let responsibilities = "";
  let qualifications = "";

  if (respIndex !== -1) {
    descriptionSummary = source.slice(0, respIndex).trim();
    if (qualIndex !== -1 && qualIndex > respIndex) {
      responsibilities = source.slice(respIndex, qualIndex).replace(respRegex, "").trim();
      qualifications = source.slice(qualIndex).replace(qualRegex, "").trim();
    } else {
      responsibilities = source.slice(respIndex).replace(respRegex, "").trim();
    }
  } else if (qualIndex !== -1) {
    descriptionSummary = source.slice(0, qualIndex).trim();
    qualifications = source.slice(qualIndex).replace(qualRegex, "").trim();
  }

  return { descriptionSummary, responsibilities, qualifications };
}


export function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorStr, setErrorStr] = useState("");
  const [successStr, setSuccessStr] = useState("");
  const [form, setForm] = useState<FormState>(INIT);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setErrorStr("Invalid job id");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/jobs/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Failed to load job");

        const sections = splitJobDescription(data?.description);
        const next: FormState = {
          title: String(data?.title || ""),
          universityName: String(data?.organizationName || ""),
          location: String(data?.location || ""),
          workplaceType: String(data?.workplaceType || "ON_SITE"),
          employmentType: String(data?.jobType || "FULL_TIME"),
          seniorityLevel: String(data?.seniorityLevel || "NOT_APPLICABLE"),
          jobFunctions: splitCsv(data?.jobFunction),
          industries: splitCsv(data?.industry),
          descriptionSummary: sections.descriptionSummary,
          responsibilities: sections.responsibilities,
          qualifications: sections.qualifications,
          skills: splitCsv(data?.requiredSkills),
          skillInput: "",
          experienceYears: Number(data?.experienceYears || 0),
          applicantMode: String(data?.applicationMode || "PLATFORM").toUpperCase() === "EXTERNAL" ? "external" : "email",
          applicantEmail: String(data?.applicationEmail || ""),
          requireResume: Boolean(data?.requireResume ?? true),
          externalUrl: String(data?.externalApplyUrl || ""),
          screeningQuestions: parseScreening(data?.screeningQuestions),
          status: String(data?.status || "OPEN").toUpperCase() === "CLOSED" ? "CLOSED" : "OPEN",
        };

        setForm(next);


      } catch (err: any) {
        setErrorStr(err?.message || "Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, token]);


  const toggleArr = (key: "jobFunctions" | "industries" | "skills", val: string, max?: number) => {
    const cur = form[key] as string[];
    if (cur.includes(val)) {
      set(key, cur.filter((x) => x !== val) as any);
      return;
    }
    if (max && cur.length >= max) return;
    set(key, [...cur, val] as any);
  };

  const toggleScreening = (type: string) => {
    const cur = form.screeningQuestions;
    set(
      "screeningQuestions",
      cur.find((q) => q.type === type)
        ? cur.filter((q) => q.type !== type)
        : [...cur, { type, mustHave: false }]
    );
  };

  const addSkills = (raw: string) => {
    const source = raw.trim();
    if (!source) return;

    let incoming: string[] = [];
    if (/[\n,;]+/.test(source)) {
      incoming = source.split(/[\n,;]+/);
    } else if (source.includes("  ")) {
      incoming = source.split(/\s{2,}/);
    } else if (source.includes(" | ")) {
      incoming = source.split(/\s\|\s/);
    } else if (source.split(/\s+/).length >= 5) {
      incoming = source.split(/\s+/);
    } else {
      incoming = [source];
    }

    incoming = incoming.map((item) => item.trim()).filter(Boolean);
    if (incoming.length === 0) return;

    setForm((prev) => {
      const next = [...prev.skills];
      for (const item of incoming) {
        if (next.length >= 10) break;
        if (!next.some((skill) => skill.toLowerCase() === item.toLowerCase())) {
          next.push(item);
        }
      }
      return { ...prev, skills: next };
    });
  };

  const addSkillFromInput = () => {
    const raw = form.skillInput.trim();
    if (!raw) return;
    addSkills(raw);
    set("skillInput", "");
  };

  const buildJobDescription = () => {
    const sections: string[] = [];
    if (form.descriptionSummary.trim()) sections.push(form.descriptionSummary.trim());
    if (form.responsibilities.trim()) {
      sections.push(`Key Responsibilities:\n${form.responsibilities.trim()}`);
    }
    if (form.qualifications.trim()) {
      sections.push(`Qualifications:\n${form.qualifications.trim()}`);
    }
    return sections.join("\n\n");
  };


  const canSave = useMemo(() => {
    if (!form.title.trim()) return false;
    if (!form.location.trim()) return false;
    if (!form.employmentType) return false;
    if (!form.descriptionSummary.trim()) return false;
    if (!form.applicantEmail.trim() && form.applicantMode === "email") return false;
    if (!form.externalUrl.trim() && form.applicantMode === "external") return false;
    return true;
  }, [form]);

  const handleSave = async () => {
    if (!token || !id) return;

    setErrorStr("");
    setSuccessStr("");
    setIsSaving(true);

    try {
      const patchRes = await apiFetch(`/api/jobs/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          organizationName: (user?.university || form.universityName || "").trim(),
          description: buildJobDescription(),
          location: form.location,
          jobType: form.employmentType,
          workplaceType: form.workplaceType,
          seniorityLevel: form.seniorityLevel,
          jobFunction: form.jobFunctions.join(","),
          industry: form.industries.join(","),
          experienceYears: form.experienceYears,
          requiredSkills: form.skills.join(","),
          screeningQuestions: form.screeningQuestions,
          applicationMode: form.applicantMode === "external" ? "EXTERNAL" : "PLATFORM",
          applicationEmail: form.applicantMode === "email" ? form.applicantEmail : "",
          requireResume: form.applicantMode === "email" ? form.requireResume : false,
          externalApplyUrl: form.applicantMode === "external" ? form.externalUrl : "",
          status: form.status,
        }),
      });

      const patchData = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) throw new Error(patchData?.error || "Failed to save job changes");

      setSuccessStr("Job post updated successfully.");
    } catch (err: any) {
      setErrorStr(err?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SmartNavbar />
        <div className="w-full px-6 py-10 md:px-10">
          <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/jobs")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to jobs
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Job Post</h1>
            <p className="text-sm text-muted-foreground">Update all entries and save changes.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/hr/jobs")} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background transition">
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || !canSave}
              onClick={handleSave}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {errorStr && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{errorStr}</p>}
        {successStr && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successStr}</p>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl bg-white p-8 shadow-sm grid gap-5">
            <h2 className="text-lg font-bold text-foreground">Job Details</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PField label="Job title" required>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} />
              </PField>
            </div>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PField label="Job location" required>
                <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inp} />
              </PField>
              <PField label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value as "OPEN" | "CLOSED")} className={inp}>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </PField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PField label="Workplace type" required>
                <select value={form.workplaceType} onChange={(e) => set("workplaceType", e.target.value)} className={inp}>
                  {WORKPLACE_TYPES.map((w) => <option key={w.v} value={w.v}>{w.l}</option>)}
                </select>
              </PField>
              <PField label="Employment type" required>
                <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inp}>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </PField>
              <PField label="Seniority level">
                <select value={form.seniorityLevel} onChange={(e) => set("seniorityLevel", e.target.value)} className={inp}>
                  {SENIORITY.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </PField>
            </div>

            <PField label="Job function (optional, select up to 3)">
              <div className="flex flex-wrap gap-2">
                {JOB_FUNCTIONS.map((fn) => {
                  const active = form.jobFunctions.includes(fn);
                  const disabled = !active && form.jobFunctions.length >= 3;
                  return (
                    <button
                      key={fn}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleArr("jobFunctions", fn, 3)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition flex items-center gap-1 ${active ? "bg-secondary text-secondary-foreground border-secondary" : disabled ? "border-border text-muted-foreground opacity-40 cursor-not-allowed" : "border-border text-foreground hover:border-foreground/60"}`}
                    >
                      {active ? <X size={10} /> : <Plus size={10} />}{fn}
                    </button>
                  );
                })}
              </div>
            </PField>

            <PField label="Recommended industries">
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => {
                  const active = form.industries.includes(ind);
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleArr("industries", ind)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition flex items-center gap-1 ${active ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-foreground hover:border-foreground/60"}`}
                    >
                      {active ? <X size={10} /> : <Plus size={10} />}{ind}
                    </button>
                  );
                })}
              </div>
            </PField>

            <PField label="Job description" required>
              <textarea value={form.descriptionSummary} onChange={(e) => set("descriptionSummary", e.target.value)} rows={4} placeholder="Describe the role overview…" className={inp + " resize-none"} />
            </PField>

            <PField label="Key responsibilities">
              <textarea value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={4} placeholder="List primary responsibilities…" className={inp + " resize-none"} />
            </PField>

            <PField label="Qualifications">
              <textarea value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} rows={4} placeholder="List required qualifications…" className={inp + " resize-none"} />
            </PField>

            <PField label="Minimum years of experience">
              <input type="number" min={0} max={30} value={form.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} className={inp} />
            </PField>

            <PField label={`Add skills (up to 10) - ${form.skills.length}/10`}>
              <div className="mb-2 flex gap-2">
                <input
                  value={form.skillInput}
                  onChange={(e) => set("skillInput", e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text && /[\n,;]+/.test(text)) {
                      e.preventDefault();
                      addSkills(text);
                      set("skillInput", "");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkillFromInput();
                    }
                  }}
                  className={inp}
                  placeholder="Type a skill and press Enter or Add"
                />
                <button type="button" onClick={addSkillFromInput} disabled={form.skills.length >= 10} className="shrink-0 rounded-xl border border-border px-4 text-sm font-medium hover:bg-background disabled:opacity-40 transition">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RECOMMENDED_SKILLS.map((sk) => {
                  const active = form.skills.includes(sk);
                  const disabled = !active && form.skills.length >= 10;
                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleArr("skills", sk, 10)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition flex items-center gap-1 ${active ? "bg-secondary text-secondary-foreground border-secondary" : disabled ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" : "border-border text-foreground hover:border-foreground/60"}`}
                    >
                      {active ? <X size={9} /> : <Plus size={9} />}{sk}
                    </button>
                  );
                })}
              </div>
            </PField>

            <div className="rounded-xl border border-border p-4 grid gap-4">
              <p className="text-sm font-semibold text-foreground">How would you like to receive your applicants?</p>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={form.applicantMode === "email"} onChange={() => set("applicantMode", "email")} className="mt-0.5 accent-foreground" />
                <div className="grid gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Let candidates apply via platform</span>
                  </div>
                  {form.applicantMode === "email" && (
                    <div className="mt-2 grid gap-2">
                      <input value={form.applicantEmail} onChange={(e) => set("applicantEmail", e.target.value)} type="email" placeholder="e.g. career@university.ac.in" className={inp} />
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={form.requireResume} onChange={(e) => set("requireResume", e.target.checked)} className="accent-foreground" />
                        Require applicants to attach a resume
                      </label>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={form.applicantMode === "external"} onChange={() => set("applicantMode", "external")} className="mt-0.5 accent-foreground" />
                <div className="grid gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Direct applicants to an external site</span>
                  </div>
                  {form.applicantMode === "external" && (
                    <input value={form.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} type="url" placeholder="https://your-career-site.com/apply" className={inp + " mt-2"} />
                  )}
                </div>
              </label>
            </div>

            <PField label="Screening Questions">
              <div className="flex flex-wrap gap-2">
                {SCREENING_OPTIONS.map((opt) => {
                  const active = !!form.screeningQuestions.find((q) => q.type === opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleScreening(opt)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition flex items-center gap-1 ${active ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-foreground hover:border-foreground/60"}`}
                    >
                      {active ? <X size={10} /> : <Plus size={10} />}{opt}
                    </button>
                  );
                })}
              </div>
            </PField>

            {form.screeningQuestions.length > 0 && (
              <div className="grid gap-2">
                {form.screeningQuestions.map((q) => (
                  <div key={q.type} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{q.type}</span>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.mustHave}
                        onChange={(e) =>
                          set(
                            "screeningQuestions",
                            form.screeningQuestions.map((x) => (x.type === q.type ? { ...x, mustHave: e.target.checked } : x))
                          )
                        }
                        className="accent-foreground"
                      />
                      Must-have
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm sticky top-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Live Preview</p>
            <article className="rounded-xl border border-border bg-white p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground shrink-0">
                  <ImageIcon size={15} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{user?.university || form.universityName || "University"}</p>
                  <h3 className="text-sm font-bold text-foreground">{form.title || "Job title preview"}</h3>
                </div>
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                {form.employmentType && <Tag>{EMPLOYMENT_TYPES.find((t) => t.v === form.employmentType)?.l || ""}</Tag>}
                {form.workplaceType && <Tag>{WORKPLACE_TYPES.find((w) => w.v === form.workplaceType)?.l || ""}</Tag>}
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${form.status === "OPEN" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  {form.status === "OPEN" ? "Open" : "Closed"}
                </span>
              </div>

              {form.location && <div className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} />{form.location}</div>}
              {form.jobFunctions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {form.jobFunctions.map((f) => (
                    <RemovableTag key={f} onRemove={() => toggleArr("jobFunctions", f, 3)}>
                      {f}
                    </RemovableTag>
                  ))}
                </div>
              )}
              {form.industries.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {form.industries.map((i) => (
                    <RemovableTag key={i} onRemove={() => toggleArr("industries", i)}>
                      {i}
                    </RemovableTag>
                  ))}
                </div>
              )}
              {form.skills.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {form.skills.map((s) => (
                    <RemovableTag key={s} onRemove={() => toggleArr("skills", s, 10)}>
                      {s}
                    </RemovableTag>
                  ))}
                </div>
              )}
              <div className="max-h-28 space-y-2 overflow-hidden text-xs text-foreground/70">
                {form.descriptionSummary.trim() ? (
                  <div className="whitespace-pre-wrap">{form.descriptionSummary}</div>
                ) : null}
                {form.responsibilities.trim() ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
                      Key responsibilities
                    </p>
                    <div className="whitespace-pre-wrap">{form.responsibilities}</div>
                  </div>
                ) : null}
                {form.qualifications.trim() ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
                      Qualifications
                    </p>
                    <div className="whitespace-pre-wrap">{form.qualifications}</div>
                  </div>
                ) : null}
                {!form.descriptionSummary.trim() && !form.responsibilities.trim() && !form.qualifications.trim()
                  ? "Job description preview"
                  : null}
              </div>
            </article>

            {successStr && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 size={14} /> {successStr}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-foreground/60">{label}{required && <span className="text-red-400"> *</span>}</span>
      {children}
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-foreground">{children}</span>;
}

function RemovableTag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-foreground transition hover:bg-background"
      aria-label={`Remove ${String(children)}`}
    >
      {children}
      <span className="text-foreground/60">×</span>
    </button>
  );
}
