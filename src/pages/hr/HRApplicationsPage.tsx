import { API_BASE } from "../../lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, CalendarDays, Mail, MapPin, Search, Star, UserRound } from "lucide-react";
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


function formatDate(iso?: string) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HRApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, role } = useAuthStore();
  const canWrite = canWriteHr(role);
  const [apps, setApps] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("SHORTLISTED");
  const selectedJobType = (searchParams.get("jobType") || "").trim().toLowerCase();

  const loadApplications = async () => {
    if (!token) {
      setApps([]);
      setIsPending(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedJobType) params.set("jobType", selectedJobType);
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (savedOnly) params.set("saved", "1");

      const response = await fetch(`${API_BASE}/api/applications${params.toString() ? `?${params.toString()}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch applications");
      const list = data || [];
      setApps(list);
      setSelectedIds([]);
    } catch {
      setApps([]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token, selectedJobType, query, statusFilter, savedOnly]);

  const updateStatus = async (applicationId: string, status: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return;

    setApps((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  };

  const toggleSaved = async (applicationId: string, isSaved: boolean) => {
    if (!token) return;
    const url = `${API_BASE}/api/hr/saved-candidates${isSaved ? `/${applicationId}` : ""}`;
    const response = await fetch(url, {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: isSaved ? undefined : JSON.stringify({ applicationId }),
    });
    if (!response.ok) return;
    setApps((prev) => prev.map((app) => (app.id === applicationId ? { ...app, isSaved: !isSaved } : app)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === apps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(apps.map((app) => app.id));
    }
  };

  const bulkUpdate = async () => {
    if (!token || selectedIds.length === 0) return;
    const response = await fetch(`${API_BASE}/api/hr/applications/bulk-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: selectedIds, status: bulkStatus }),
    });
    if (!response.ok) return;
    setApps((prev) => prev.map((app) => (selectedIds.includes(app.id) ? { ...app, status: bulkStatus } : app)));
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">All Applications</h1>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium">{apps?.length || 0} total</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative flex min-w-[220px] flex-1 items-center">
            <Search size={16} className="absolute left-3 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, skill, or role"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-foreground/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={savedOnly}
              onChange={(e) => setSavedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Saved only
          </label>
        </div>

        {canWrite && selectedIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold text-foreground">{selectedIds.length} selected</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={bulkUpdate}
                className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white transition hover:opacity-80"
              >
                Apply Status
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-background"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {selectedJobType && (
          <div className="mb-4 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm">
            Showing applications for role: <span className="font-semibold">{selectedJobType.charAt(0).toUpperCase() + selectedJobType.slice(1)}</span>
          </div>
        )}

        {isPending && <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>}

        {!isPending && (!apps || apps.length === 0) && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-muted-foreground">No applications yet. Post a job to start receiving applications.</p>
          </div>
        )}

        {!isPending && apps && apps.length > 0 && (
          <div>
            {canWrite && (
              <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedIds.length === apps.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border"
                />
                Select all
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
            {apps.map((app, i) => (
              <motion.div
                key={app.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {canWrite && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="mt-2 h-4 w-4 rounded border-border"
                      />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-white/60 text-foreground">
                      <UserRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{app.candidate?.name || "Candidate"}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground/65 truncate"><Mail size={11} />{app.candidate?.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!canWrite}
                      onClick={() => toggleSaved(app.id, Boolean(app.isSaved))}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${app.isSaved ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border text-foreground"} ${!canWrite ? "opacity-60" : "hover:bg-background"}`}
                      title={app.isSaved ? "Saved" : "Save"}
                    >
                      <Star size={12} className={app.isSaved ? "fill-amber-500" : ""} />
                    </button>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[String(app.status).toUpperCase()] || "bg-muted text-muted-foreground"}`}>
                      {String(app.status || "PENDING").charAt(0) + String(app.status || "PENDING").slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-4 grid gap-2 text-xs text-foreground/70 sm:grid-cols-2">
                  <p className="flex items-center gap-1.5"><Briefcase size={12} />{app.job?.title || "Job"}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} />{app.job?.location || "Location"}</p>
                  <p className="flex items-center gap-1.5"><CalendarDays size={12} />Applied {formatDate(app.appliedAt)}</p>
                  <p className="flex items-center gap-1.5"><Briefcase size={12} />{app.job?.jobType || "N/A"}</p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/hr/applications/${app.id}`)}
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    View Application
                  </button>
                  <span className="text-xs text-foreground/60">Notes: {app.notesCount || 0}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => updateStatus(app.id, s)}
                      disabled={!canWrite}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${String(app.status).toUpperCase() === s ? STATUS_COLOR[s] : "bg-muted text-muted-foreground"} ${!canWrite ? "opacity-60" : ""}`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}