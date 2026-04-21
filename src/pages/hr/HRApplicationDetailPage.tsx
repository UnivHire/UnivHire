import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Mail, MapPin, Phone, User, X } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  HIRED: "bg-purple-100 text-purple-700",
};

export function HRApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [application, setApplication] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) {
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch application");
        setApplication(data);
      } catch {
        setApplication(null);
      } finally {
        setIsPending(false);
      }
    };

    load();
  }, [token, id]);

  const resumeHref = useMemo(() => {
    const url = application?.resumeUrl;
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    if (url.startsWith("uploads/")) return `http://localhost:5000/${url}`;
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[String(application.status).toUpperCase()] || "bg-muted text-muted-foreground"}`}
              >
                {String(application.status).charAt(0).toUpperCase() + String(application.status).slice(1).toLowerCase()}
              </span>
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
          </div>
        )}

        {resumeModalOpen && resumeHref && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Resume PDF preview">
            <div className="h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
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
