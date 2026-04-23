import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Image as ImageIcon, MapPin, Plus, X, Mail, ExternalLink } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

/* ─── Constants ─────────────────────────────────────────── */
const EMPLOYMENT_TYPES = [
  { v: "FULL_TIME", l: "Full-time" }, { v: "PART_TIME", l: "Part-time" },
  { v: "CONTRACT", l: "Contract" }, { v: "INTERNSHIP", l: "Internship" },
  { v: "TEMPORARY", l: "Temporary" },
];
const WORKPLACE_TYPES = [
  { v: "ON_SITE", l: "On-site" }, { v: "REMOTE", l: "Remote" }, { v: "HYBRID", l: "Hybrid" },
];
const SENIORITY = [
  { v: "NOT_APPLICABLE", l: "Not Applicable" }, { v: "INTERNSHIP", l: "Internship" },
  { v: "ENTRY", l: "Entry level" }, { v: "ASSOCIATE", l: "Associate" },
  { v: "MID_SENIOR", l: "Mid-Senior level" }, { v: "DIRECTOR", l: "Director" },
  { v: "EXECUTIVE", l: "Executive" },
];
const JOB_FUNCTIONS = [
  "Administrative","Education","Research","Engineering","Finance",
  "Human Resources","Information Technology","Management","Marketing","Operations","Other",
];
const INDUSTRIES = [
  "Higher Education","Education Administration Programs","Primary/Secondary Education",
  "Government Administration","Non-profit Organizations","Research Services",
  "Information Technology","Healthcare","Other",
];
const RECOMMENDED_SKILLS = [
  "Microsoft Office","Microsoft Excel","Microsoft Outlook","Microsoft PowerPoint",
  "Communication","Office Software","Phone Etiquette","Inventory Control",
  "Office Equipment","Control System","Leadership","Problem Solving",
  "Teamwork","Time Management","Research","Data Analysis",
];
const SCREENING_OPTIONS = [
  "Background Check","Driver's License","Drug Test","Education",
  "Industry Experience","Language","Hybrid Work","Remote Work",
  "Onsite Work","Work Experience","Work Authorization","Visa Status","Urgent Hiring Need",
];

/* ─── Types ──────────────────────────────────────────────── */
interface FormState {
  title: string; universityName: string; location: string;
  workplaceType: string; employmentType: string; seniorityLevel: string;
  jobFunctions: string[]; industries: string[];
  description: string; skills: string[]; skillInput: string;
  experienceYears: number;
  applicantMode: "email" | "external";
  applicantEmail: string; requireResume: boolean; externalUrl: string;
  screeningQuestions: { type: string; mustHave: boolean }[];
}
const INIT: FormState = {
  title:"", universityName:"", location:"",
  workplaceType:"ON_SITE", employmentType:"", seniorityLevel:"NOT_APPLICABLE",
  jobFunctions:[], industries:[],
  description:"", skills:[], skillInput:"", experienceYears:0,
  applicantMode:"email", applicantEmail:"", requireResume:true, externalUrl:"",
  screeningQuestions:[],
};

/* ─── Shared input style ─────────────────────────────────── */
const inp = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition";

/* ─── Main Component ─────────────────────────────────────── */
export function PostJobPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...INIT, universityName: user?.university || "" });
  const [logoPreview, setLogoPreview] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorStr, setErrorStr] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => () => { if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview); }, [logoPreview]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(f));
  };

  const toggleArr = (key: "jobFunctions"|"industries"|"skills", val: string, max?: number) => {
    const cur = form[key] as string[];
    if (cur.includes(val)) { set(key, cur.filter(x => x !== val) as any); return; }
    if (max && cur.length >= max) return;
    set(key, [...cur, val] as any);
  };
  const toggleScreening = (type: string) => {
    const cur = form.screeningQuestions;
    set("screeningQuestions", cur.find(q => q.type === type)
      ? cur.filter(q => q.type !== type)
      : [...cur, { type, mustHave: false }]);
  };

  const addSkillFromInput = () => {
    const s = form.skillInput.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 10) return;
    set("skills", [...form.skills, s]); set("skillInput", "");
  };

  const canNext1 =
    form.title &&
    form.universityName &&
    form.location &&
    form.employmentType &&
    form.jobFunctions.length > 0 &&
    form.industries.length > 0;

  const canNext2 =
    form.description.trim().length > 0 &&
    form.skills.length > 0 && (
    form.applicantMode === "email" ? !!form.applicantEmail : !!form.externalUrl
  );

  const handleSubmit = async () => {
    setIsPending(true); setErrorStr("");
    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          organizationName: form.universityName,
          description: form.description,
          location: form.location,
          jobType: form.employmentType, workplaceType: form.workplaceType,
          seniorityLevel: form.seniorityLevel, jobFunction: form.jobFunctions.join(","),
          industry: form.industries.join(","), experienceYears: form.experienceYears,
          requiredSkills: form.skills.join(","),
          screeningQuestions: form.screeningQuestions,
          applicantMode: form.applicantMode,
          applicantEmail: form.applicantEmail,
          requireResume: form.requireResume,
          externalUrl: form.externalUrl,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setSuccess(true);
    } catch (err: any) { setErrorStr(err.message); }
    finally { setIsPending(false); }
  };

  /* ── Progress bar ── */
  const steps = ["Job Details", "Description & Skills", "Screening"];

  if (success) return (
    <div className="min-h-screen bg-background"><SmartNavbar />
      <div className="mx-auto max-w-xl px-6 py-20">
        <motion.div className="rounded-2xl bg-white p-10 text-center shadow-sm" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}>
          <CheckCircle2 size={52} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="mb-2 text-xl font-bold">Job Posted Successfully!</h2>
          <p className="mb-6 text-sm text-muted-foreground">Your posting is live and will appear to candidates after review.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSuccess(false); setStep(1); setForm({...INIT, universityName: user?.university||""}); setLogoPreview(""); }} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-background transition">Post Another</button>
            <button onClick={() => navigate("/hr/jobs")} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">View My Jobs</button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Post a New Job</h1>
        <p className="mb-8 text-sm text-muted-foreground">Fill in the details below to publish your job posting.</p>

        {/* ── Stepper ── */}
        <div className="mb-8 flex items-center gap-0">
          {steps.map((s, i) => {
            const n = i + 1;
            const done = step > n; const active = step === n;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition
                    ${done ? "bg-emerald-500 text-white" : active ? "bg-foreground text-white" : "bg-border text-muted-foreground"}`}>
                    {done ? <CheckCircle2 size={16}/> : n}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > n ? "bg-emerald-400" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── FORM AREA ── */}
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.2 }}
              className="rounded-2xl bg-white p-8 shadow-sm">

              {/* ════ STEP 1 ════ */}
              {step === 1 && (
                <div className="grid gap-5">
                  <h2 className="text-lg font-bold text-foreground">Step 1: What job do you want to post?</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <PField label="Company / University" required>
                      <input value={form.universityName} onChange={e => set("universityName",e.target.value)} required placeholder="e.g. GLA University" className={inp}/>
                    </PField>
                    <PField label="Job title" required>
                      <input value={form.title} onChange={e => set("title",e.target.value)} required placeholder="e.g. Office Assistant" className={inp}/>
                    </PField>
                  </div>

                  <PField label="University logo (image)">
                    <input type="file" accept="image/*" onChange={handleLogo} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"/>
                  </PField>

                  <PField label="Job location" required>
                    <input value={form.location} onChange={e => set("location",e.target.value)} required placeholder="e.g. Mathura, Uttar Pradesh, India" className={inp}/>
                  </PField>

                  <div className="grid grid-cols-2 gap-4">
                    <PField label="Workplace type" required>
                      <select value={form.workplaceType} onChange={e => set("workplaceType",e.target.value)} className={inp}>
                        {WORKPLACE_TYPES.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
                      </select>
                    </PField>
                    <PField label="Employment type" required>
                      <select value={form.employmentType} onChange={e => set("employmentType",e.target.value)} required className={inp}>
                        <option value="">Select…</option>
                        {EMPLOYMENT_TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                      </select>
                    </PField>
                  </div>

                  <PField label="Seniority level">
                    <select value={form.seniorityLevel} onChange={e => set("seniorityLevel",e.target.value)} className={inp}>
                      {SENIORITY.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                    </select>
                  </PField>

                  <PField label="Job function (select up to 3)">
                    <div className="flex flex-wrap gap-2 pt-1">
                      {JOB_FUNCTIONS.map(fn => {
                        const active = form.jobFunctions.includes(fn);
                        const disabled = !active && form.jobFunctions.length >= 3;
                        return (
                          <button key={fn} type="button" disabled={disabled} onClick={() => toggleArr("jobFunctions",fn,3)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition flex items-center gap-1
                              ${active?"bg-foreground text-white border-foreground":disabled?"border-border text-muted-foreground opacity-40 cursor-not-allowed":"border-border text-foreground hover:border-foreground/60"}`}>
                            {active?<X size={10}/>:<Plus size={10}/>}{fn}
                          </button>
                        );
                      })}
                    </div>
                  </PField>

                  <PField label="Recommended industries">
                    <div className="flex flex-wrap gap-2 pt-1">
                      {INDUSTRIES.map(ind => {
                        const active = form.industries.includes(ind);
                        return (
                          <button key={ind} type="button" onClick={() => toggleArr("industries",ind)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition flex items-center gap-1
                              ${active?"bg-foreground text-white border-foreground":"border-border text-foreground hover:border-foreground/60"}`}>
                            {active?<X size={10}/>:<Plus size={10}/>}{ind}
                          </button>
                        );
                      })}
                    </div>
                  </PField>

                  <div className="flex justify-end mt-2">
                    <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                      className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-40 transition">
                      Next <ArrowRight size={15}/>
                    </button>
                  </div>
                </div>
              )}

              {/* ════ STEP 2 ════ */}
              {step === 2 && (
                <div className="grid gap-5">
                  <h2 className="text-lg font-bold text-foreground">Step 2: Description, Skills & Applicant Settings</h2>

                  <PField label="Job description" required>
                    <textarea value={form.description} onChange={e => set("description",e.target.value)} rows={6}
                      placeholder="Describe the role, responsibilities, qualifications…" className={inp+" resize-none"}/>
                  </PField>

                  <PField label="Minimum years of experience">
                    <input type="number" min={0} max={30} value={form.experienceYears} onChange={e => set("experienceYears",Number(e.target.value))} className={inp}/>
                  </PField>

                  {/* Skills */}
                  <PField label={`Add skills (up to 10) — ${form.skills.length}/10`}>
                    <div className="flex gap-2 mb-2">
                      <input value={form.skillInput} onChange={e => set("skillInput",e.target.value)}
                        onKeyDown={e => { if(e.key==="Enter"){ e.preventDefault(); addSkillFromInput(); }}}
                        placeholder="Type a skill and press Enter or Add" className={inp}/>
                      <button type="button" onClick={addSkillFromInput} disabled={form.skills.length>=10}
                        className="shrink-0 rounded-xl border border-border px-4 text-sm font-medium hover:bg-background disabled:opacity-40 transition">Add</button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">Recommended:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {RECOMMENDED_SKILLS.map(sk => {
                        const active = form.skills.includes(sk);
                        const disabled = !active && form.skills.length >= 10;
                        return (
                          <button key={sk} type="button" disabled={disabled} onClick={() => toggleArr("skills",sk,10)}
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition flex items-center gap-1
                              ${active?"bg-foreground text-white border-foreground":disabled?"opacity-40 cursor-not-allowed border-border text-muted-foreground":"border-border text-foreground hover:border-foreground/60"}`}>
                            {active?<X size={9}/>:<Plus size={9}/>}{sk}
                          </button>
                        );
                      })}
                    </div>
                  </PField>

                  {/* How to receive applicants */}
                  <div className="rounded-xl border border-border p-4 grid gap-4">
                    <p className="text-sm font-semibold text-foreground">How would you like to receive your applicants?</p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" checked={form.applicantMode==="email"} onChange={() => set("applicantMode","email")} className="mt-0.5 accent-foreground"/>
                      <div className="grid gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-muted-foreground"/>
                          <span className="text-sm font-medium text-foreground">Let candidates apply via platform</span>
                        </div>
                        <p className="text-xs text-muted-foreground">You get notified by email when someone applies.</p>
                        {form.applicantMode==="email" && (
                          <div className="mt-2 grid gap-2">
                            <input value={form.applicantEmail} onChange={e => set("applicantEmail",e.target.value)}
                              placeholder="e.g. career@university.ac.in" type="email" className={inp}/>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                              <input type="checkbox" checked={form.requireResume} onChange={e => set("requireResume",e.target.checked)} className="accent-foreground"/>
                              Require applicants to attach a resume
                            </label>
                          </div>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" checked={form.applicantMode==="external"} onChange={() => set("applicantMode","external")} className="mt-0.5 accent-foreground"/>
                      <div className="grid gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-muted-foreground"/>
                          <span className="text-sm font-medium text-foreground">Direct applicants to an external site</span>
                        </div>
                        {form.applicantMode==="external" && (
                          <input value={form.externalUrl} onChange={e => set("externalUrl",e.target.value)}
                            placeholder="https://your-career-site.com/apply" type="url" className={inp+" mt-2"}/>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between mt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-background transition">
                      <ArrowLeft size={15}/> Back
                    </button>
                    <button type="button" disabled={!canNext2} onClick={() => setStep(3)}
                      className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-40 transition">
                      Next <ArrowRight size={15}/>
                    </button>
                  </div>
                </div>
              )}

              {/* ════ STEP 3 ════ */}
              {step === 3 && (
                <div className="grid gap-5">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Step 3: Add Screening Questions</h2>
                    <p className="text-xs text-muted-foreground mt-1">Screening questions help filter applicants. Selected questions will be shown when candidates apply. Recommend adding 3 or more.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SCREENING_OPTIONS.map(opt => {
                      const active = !!form.screeningQuestions.find(q => q.type===opt);
                      return (
                        <button key={opt} type="button" onClick={() => toggleScreening(opt)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition flex items-center gap-1
                            ${active?"bg-foreground text-white border-foreground":"border-border text-foreground hover:border-foreground/60"}`}>
                          {active?<X size={10}/>:<Plus size={10}/>}{opt}
                        </button>
                      );
                    })}
                  </div>

                  {form.screeningQuestions.length > 0 && (
                    <div className="grid gap-2">
                      <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Selected Questions</p>
                      {form.screeningQuestions.map(q => (
                        <div key={q.type} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                          <span className="text-sm font-medium text-foreground">{q.type}</span>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={q.mustHave}
                              onChange={e => set("screeningQuestions", form.screeningQuestions.map(x => x.type===q.type?{...x,mustHave:e.target.checked}:x))}
                              className="accent-foreground"/>
                            Must-have
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {errorStr && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-4 py-2">Error: {errorStr}</p>}

                  <div className="flex justify-between mt-2">
                    <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-background transition">
                      <ArrowLeft size={15}/> Back
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={isPending || form.screeningQuestions.length === 0}
                      className="rounded-full bg-foreground px-8 py-2.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition">
                      {isPending ? "Posting…" : "Submit Job Posting →"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── LIVE PREVIEW (sticky) ── */}
          <div className="rounded-2xl bg-white p-5 shadow-sm h-fit sticky top-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Live Preview</p>
            <article className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-start gap-3">
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className="h-11 w-11 rounded-lg object-cover border border-border shrink-0"/>
                  : <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground shrink-0"><ImageIcon size={15}/></div>}
                <div>
                  <p className="text-[11px] text-muted-foreground">{form.universityName||"University name"}</p>
                  <h3 className="text-sm font-bold text-foreground">{form.title||"Job title preview"}</h3>
                </div>
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                {form.employmentType && <Tag>{EMPLOYMENT_TYPES.find(t=>t.v===form.employmentType)?.l||""}</Tag>}
                {form.workplaceType && <Tag>{WORKPLACE_TYPES.find(w=>w.v===form.workplaceType)?.l||""}</Tag>}
                <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">Open</span>
              </div>

              {form.location && <div className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11}/>{form.location}</div>}

              {form.jobFunctions.length>0 && (
                <div className="mb-2 flex flex-wrap gap-1">{form.jobFunctions.map(f=><Tag key={f}>{f}</Tag>)}</div>
              )}
              {form.skills.length>0 && (
                <div className="mb-2 flex flex-wrap gap-1">{form.skills.map(s=><Tag key={s}>{s}</Tag>)}</div>
              )}

              <p className="line-clamp-4 text-xs text-foreground/70">
                {form.description||"Job description will appear here as you type."}
              </p>
              {form.experienceYears>0 && <p className="mt-2 text-[11px] text-muted-foreground">Min. {form.experienceYears} yr{form.experienceYears!==1?"s":""} exp.</p>}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function PField({ label, children, required }: { label:string; children:React.ReactNode; required?:boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-foreground/60">{label}{required&&<span className="text-red-400"> *</span>}</span>
      {children}
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-foreground">{children}</span>;
}