import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, MapPin } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const CATEGORIES = ["Faculty","Trainer","Driver","Security","Peon","Admin Staff","Operations","Research","Technical","Other"];

export function PostJobPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const [errorStr, setErrorStr] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    universityName: user?.university || "",
    logoUrl: "",
    location: "",
    description: "",
    isVerified: false,
  });
  const [logoPreview, setLogoPreview] = useState("");

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    const objectUrl = URL.createObjectURL(file);
    set("logoUrl", objectUrl);
    setLogoPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorStr("");
    
    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          jobType: form.category
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post job");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorStr(err.message || "An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <h1 className="mb-7 text-2xl font-bold text-foreground">Post a New Job</h1>

        {success ? (
          <motion.div className="rounded-2xl bg-white p-10 text-center shadow-sm" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="mb-2 text-xl font-bold text-foreground">Job Posted!</h2>
            <p className="mb-6 text-sm text-muted-foreground">Your posting is under review and will appear to candidates once verified.</p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => { setSuccess(false); setForm({ title: "", category: "", universityName: user?.university || "", location: "", description: "", isVerified: false }); }} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background transition">Post Another</button>
              <button type="button" onClick={() => navigate("/hr/jobs")} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">View My Jobs</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="grid gap-5">
                <PField label="Job title" required>
                  <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Assistant Professor — Mathematics" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                </PField>
                <PField label="Category / Role type" required>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition">
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </PField>
                <PField label="University name" required>
                  <input type="text" value={form.universityName} onChange={(e) => set("universityName", e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                </PField>
                <PField label="University logo (image)">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                </PField>
                <PField label="Location (City, State)" required>
                  <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} required placeholder="e.g. Delhi, UP" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition" />
                </PField>
                <PField label="Job description" required>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={5} placeholder="Describe the role, requirements, responsibilities…" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition resize-none" />
                </PField>
                {errorStr && <p className="text-xs text-red-500">Error: {errorStr}</p>}
                <button type="submit" disabled={isPending} className="w-full rounded-full bg-foreground py-3.5 text-sm font-bold text-white hover:opacity-80 disabled:opacity-60 transition">
                  {isPending ? "Posting…" : "Submit Job Posting →"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm h-fit">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Preview</p>

              <article className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img src={logoPreview} alt="University logo preview" className="h-12 w-12 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">{form.universityName || "University name"}</p>
                      <h3 className="text-base font-bold text-foreground">{form.title || "Job title preview"}</h3>
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {form.category || "Category"}
                  </span>
                  <span className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-foreground">
                    Open
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  <span>{form.location || "Location"}</span>
                </div>

                <p className="line-clamp-5 text-sm text-foreground/80">
                  {form.description || "Job description preview will appear here as you type."}
                </p>
              </article>
            </div>
          </div>
        )}
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