import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GripVertical } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { API_BASE } from "../../lib/api";
import { canWriteHr, useAuthStore } from "../../store/authStore";

const STATUSES = ["PENDING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "HIRED"] as const;
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export function HRPipelinePage() {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();
  const canWrite = canWriteHr(role);
  const [apps, setApps] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);

  const loadApplications = async () => {
    if (!token) {
      setApps([]);
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch applications");
      setApps(data || []);
    } catch {
      setApps([]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    STATUSES.forEach((s) => (map[s] = []));
    apps.forEach((app) => {
      const status = String(app.status || "PENDING").toUpperCase();
      if (!map[status]) map[status] = [];
      map[status].push(app);
    });
    return map;
  }, [apps]);

  const updateStatus = async (applicationId: string, status: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;
    setApps((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
  };

  const handleDrop = (status: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canWrite) return;
    const applicationId = event.dataTransfer.getData("applicationId");
    if (applicationId) {
      updateStatus(applicationId, status);
    }
  };

  const handleDragStart = (applicationId: string, event: React.DragEvent<HTMLDivElement>) => {
    if (!canWrite) return;
    event.dataTransfer.setData("applicationId", applicationId);
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/hr/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Candidate Pipeline</h1>
          <button
            type="button"
            onClick={() => navigate("/hr/applications")}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-background"
          >
            Open Applications List
          </button>
        </div>

        {isPending && <div className="h-28 rounded-2xl bg-muted animate-pulse" />}

        {!isPending && (
          <div className="grid gap-4 xl:grid-cols-6">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(status, event)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{STATUS_LABEL[status]}</p>
                  <span className="text-xs text-muted-foreground">{grouped[status]?.length || 0}</span>
                </div>
                <div className="space-y-2">
                  {grouped[status]?.map((app) => (
                    <div
                      key={app.id}
                      draggable={canWrite}
                      onDragStart={(event) => handleDragStart(app.id, event)}
                      className={`rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-sm ${canWrite ? "cursor-grab" : "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{app.candidate?.name || "Candidate"}</p>
                          <p className="truncate text-[11px] text-foreground/60">{app.job?.title || "Job"}</p>
                        </div>
                        <GripVertical size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  {grouped[status]?.length === 0 && (
                    <p className="text-xs text-muted-foreground">No candidates</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
