import { API_BASE } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Mail, MapPin, Phone, Star, User, X } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { canWriteHr, useAuthStore } from "../../store/authStore";

const STATUSES = ["PENDING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "HIRED"];
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  INTERVIEW: "bg-sky-100 text-sky-700",
  SELECTED: "bg-indigo-100 text-indigo-700",
  REJECTED: "bg-red-100 text-red-600",
  HIRED: "bg-purple-100 text-purple-700",
};

export function HRApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token, role } = useAuthStore();
  const canWrite = canWriteHr(role);
  const [application, setApplication] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) {
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch application");
        setApplication({ ...data, isSaved: Array.isArray(data?.hrSaves) && data.hrSaves.length > 0 });
        setNotes(Array.isArray(data?.notes) ? data.notes : []);
      } catch {
        setApplication(null);
      } finally {
        setIsPending(false);
      }
    };

    load();
  }, [token, id]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE}/api/hr/email-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setTemplates(data || []);
      } catch {
        setTemplates([]);
      }
    };
    loadTemplates();
  }, [token]);

  const updateStatus = async (status: string) => {
    if (!token || !application) return;
    const response = await fetch(`${API_BASE}/api/applications/${application.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, sendEmail, templateId: selectedTemplateId || undefined }),
    });
    if (!response.ok) return;
    setApplication((prev: any) => (prev ? { ...prev, status } : prev));
  };

  const toggleSaved = async () => {
    if (!token || !application) return;
    const isSaved = Boolean(application.isSaved);
    const url = `${API_BASE}/api/hr/saved-candidates${isSaved ? `/${application.id}` : ""}`;
    const response = await fetch(url, {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: isSaved ? undefined : JSON.stringify({ applicationId: application.id }),
    });
    if (!response.ok) return;
    setApplication((prev: any) => (prev ? { ...prev, isSaved: !isSaved } : prev));
  };

  const addNote = async () => {
    if (!token || !application || !noteInput.trim()) return;
    setIsSavingNote(true);
    try {
      const response = await fetch(`${API_BASE}/api/hr/applications/${application.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) return;
      setNotes((prev) => [data, ...prev]);
      setNoteInput("");
    } finally {
      setIsSavingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/hr/notes/${noteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const resumeHref = useMemo(() => {
    const url = application?.resumeUrl;
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
    if (url.startsWith("uploads/")) return `${API_BASE}/${url}`;
    // Legacy placeholder values like "pdf:file.pdf" are not openable URLs.
    return "";
  }, [application?.resumeUrl]);

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/hr/applications")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={15} /> Back to applications
        </button>

        {isPending && <div className="h-44 rounded-2xl bg-muted animate-pulse" />}

        {!isPending && !application && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-muted-foreground">Application not found.</p>
          </div>
        )}

        {!isPending && application && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-foreground">Application Details</h1>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canWrite}
                  onClick={toggleSaved}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${application.isSaved ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border text-foreground"} ${!canWrite ? "opacity-60" : "hover:bg-background"}`}
                >
                  <Star size={12} className={application.isSaved ? "fill-amber-500" : ""} />
                </button>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(application.status).toUpperCase()] || "bg-muted text-muted-foreground"}`}
                >
                  {String(application.status).charAt(0).toUpperCase() + String(application.status).slice(1).toLowerCase()}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow icon={<User size={14} />} label="Candidate" value={application.candidate?.name || "N/A"} />
              <InfoRow icon={<Mail size={14} />} label="Email" value={application.candidate?.email || "N/A"} />
              <InfoRow icon={<Phone size={14} />} label="Phone" value={application.candidatePhone || "Not provided"} />
              <InfoRow icon={<MapPin size={14} />} label="Current location" value={application.currentLocation || "Not provided"} />
              <InfoRow icon={<MapPin size={14} />} label="Address" value={application.candidateAddress || "Not provided"} />
              <InfoRow icon={<Briefcase size={14} />} label="Applied for" value={application.job?.title || "N/A"} />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resume</p>
              {resumeHref ? (
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(true)}
                  className="text-sm font-semibold text-secondary hover:underline"
                >
                  Open Resume PDF
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">Resume is unavailable for this application.</p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update status</p>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                    disabled={!canWrite}
                  />
                  Send email to candidate
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-foreground/40"
                  disabled={!sendEmail || !canWrite}
                >
                  <option value="">Default template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!canWrite}
                    onClick={() => updateStatus(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${String(application.status).toUpperCase() === s ? STATUS_COLOR[s] : "bg-muted text-muted-foreground"} ${!canWrite ? "opacity-60" : "hover:opacity-80"}`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              <div className="mb-4 flex gap-2">
                <input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note…"
                  className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                  disabled={!canWrite}
                />
                <button
                  type="button"
                  onClick={addNote}
                  disabled={!canWrite || !noteInput.trim() || isSavingNote}
                  className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white transition hover:opacity-80 disabled:opacity-60"
                >
                  Add
                </button>
              </div>
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {resumeModalOpen && resumeHref && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Resume PDF preview">
            <div className="h-[88vh] w-full max-w-[96vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Resume Preview</p>
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(false)}
                  className="rounded-lg border border-border p-1.5 text-foreground/70 transition hover:bg-background"
                  aria-label="Close resume preview"
                >
                  <X size={16} />
                </button>
              </div>
              <iframe src={resumeHref} title="Candidate Resume PDF" className="h-[calc(88vh-52px)] w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm text-foreground break-words">{value}</p>
    </div>
  );
}
