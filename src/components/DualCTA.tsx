import { useState } from "react";
import { useMutation } from "@animaapp/playground-react-sdk";
import { Building2, UserSearch, CheckCircle2 } from "lucide-react";

export function DualCTA() {
  const { create: createUniversityRegistration, isPending: isRegistering, error: registrationError } = useMutation("UniversityRegistration");
  const { create: createContactInquiry, isPending: isContacting, error: contactError } = useMutation("ContactInquiry");

  const [regForm, setRegForm] = useState({ universityName: "", contactPerson: "", workEmail: "", phoneNumber: "", state: "" });
  const [candForm, setCandForm] = useState({ name: "", email: "", subject: "Candidate inquiry", message: "" });
  const [regSuccess, setRegSuccess] = useState(false);
  const [candSuccess, setCandSuccess] = useState(false);

  const submitReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(false);
    try {
      await createUniversityRegistration(regForm);
      setRegSuccess(true);
      setRegForm({ universityName: "", contactPerson: "", workEmail: "", phoneNumber: "", state: "" });
    } catch { /* error shown below */ }
  };

  const submitCand = async (e: React.FormEvent) => {
    e.preventDefault();
    setCandSuccess(false);
    try {
      await createContactInquiry(candForm);
      setCandSuccess(true);
      setCandForm({ name: "", email: "", subject: "Candidate inquiry", message: "" });
    } catch { /* error shown below */ }
  };

  return (
    <section className="px-6 py-20 md:px-10" id="for-candidates">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          {/* University side — peach */}
          <div id="for-universities" className="relative overflow-hidden p-8 md:p-12" style={{ backgroundColor: "hsl(var(--color-card-peach))" }}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-white/50 px-3 py-1.5">
                <Building2 size={13} className="text-foreground" />
                <span className="text-xs font-semibold text-foreground">For HR Departments</span>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Register Your University</h2>
              <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
                Create a trusted presence for your HR team and start publishing verified opportunities.
              </p>

              {regSuccess ? (
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4">
                  <CheckCircle2 size={20} className="text-success" />
                  <p className="text-sm font-medium text-foreground">Registration received! We&#39;ll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={submitReg} className="grid gap-3">
                  <LightInput label="University name" value={regForm.universityName} onChange={(v) => setRegForm((p) => ({ ...p, universityName: v }))} />
                  <LightInput label="HR contact person" value={regForm.contactPerson} onChange={(v) => setRegForm((p) => ({ ...p, contactPerson: v }))} />
                  <LightInput label="Work email" type="email" value={regForm.workEmail} onChange={(v) => setRegForm((p) => ({ ...p, workEmail: v }))} />
                  <LightInput label="Phone number" value={regForm.phoneNumber} onChange={(v) => setRegForm((p) => ({ ...p, phoneNumber: v }))} />
                  <LightInput label="State" value={regForm.state} onChange={(v) => setRegForm((p) => ({ ...p, state: v }))} />
                  <button type="submit" disabled={isRegistering} className="mt-1 rounded-full bg-foreground px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-60">
                    {isRegistering ? "Submitting…" : "Register your university →"}
                  </button>
                  {registrationError && <p className="text-xs text-warning">Error: {registrationError.message}</p>}
                </form>
              )}
            </div>
          </div>

          {/* Candidate side — lavender */}
          <div className="relative overflow-hidden p-8 md:p-12" style={{ backgroundColor: "hsl(var(--color-card-lavender))" }}>
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-white/50 px-3 py-1.5">
                <UserSearch size={13} className="text-foreground" />
                <span className="text-xs font-semibold text-foreground">For Candidates</span>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Find Your Job Today</h2>
              <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
                Tell us what role you&#39;re seeking and we&#39;ll direct your inquiry toward verified opportunities.
              </p>

              {candSuccess ? (
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4">
                  <CheckCircle2 size={20} className="text-success" />
                  <p className="text-sm font-medium text-foreground">Inquiry submitted! Expect a response within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={submitCand} className="grid gap-3">
                  <LightInput label="Your name" value={candForm.name} onChange={(v) => setCandForm((p) => ({ ...p, name: v }))} />
                  <LightInput label="Email" type="email" value={candForm.email} onChange={(v) => setCandForm((p) => ({ ...p, email: v }))} />
                  <LightInput label="Subject" value={candForm.subject} onChange={(v) => setCandForm((p) => ({ ...p, subject: v }))} />
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-foreground/60">Message</span>
                    <textarea
                      value={candForm.message}
                      onChange={(e) => setCandForm((p) => ({ ...p, message: e.target.value }))}
                      required
                      rows={4}
                      className="rounded-xl border border-foreground/15 bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-foreground/40"
                      placeholder="Tell us which roles or locations interest you…"
                    />
                  </label>
                  <button type="submit" disabled={isContacting} className="mt-1 rounded-full bg-foreground px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-60">
                    {isContacting ? "Sending…" : "Send candidate inquiry →"}
                  </button>
                  {contactError && <p className="text-xs text-warning">Error: {contactError.message}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LightInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-xl border border-foreground/15 bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/40"
      />
    </label>
  );
}