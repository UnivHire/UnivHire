import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { useAuthStore } from "../../store/authStore";

const STATUS_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  PENDING: { icon: <Clock size={13} />, color: "bg-amber-100 text-amber-700" },
  SHORTLISTED: { icon: <CheckCircle2 size={13} />, color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { icon: <XCircle size={13} />, color: "bg-red-100 text-red-600" },
  HIRED: { icon: <Trophy size={13} />, color: "bg-purple-100 text-purple-700" },
};

export function CandidateApplicationsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!token) {
      setApplications([]);
      setIsPending(false);
      return;
    }

    fetch("http://localhost:5000/api/applications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch applications");
        setApplications(Array.isArray(data) ? data : []);
        setIsPending(false);
      })
      .catch(() => {
        setApplications([]);
        setIsPending(false);
      });
  }, [token]);

  const filtered = useMemo(() => {
    return applications.filter((application) => {
      const normalizedStatus = String(application.status || "PENDING").toUpperCase();
      const query = search.trim().toLowerCase();
      const matchStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
      const matchSearch =
        !query ||
        String(application.job?.title || "").toLowerCase().includes(query) ||
        String(application.job?.location || "").toLowerCase().includes(query);

      return matchStatus && matchSearch;
    });
  }, [applications, search, statusFilter]);

  const counters = [
    { label: "Total", value: applications.length, tone: "card-peach" },
    {
      label: "Pending",
      value: applications.filter((item) => String(item.status).toUpperCase() === "PENDING").length,
      tone: "card-mint",
    },
    {
      label: "Shortlisted",
      value: applications.filter((item) => String(item.status).toUpperCase() === "SHORTLISTED").length,
      tone: "card-lavender",
    },
    {
      label: "Hired",
      value: applications.filter((item) => String(item.status).toUpperCase() === "HIRED").length,
      tone: "card-sky",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <CandidatePageHeader
          eyebrow="Applications"
          title="My Applications"
          description="Track every role you have applied to, see current status, and stay ready for the next follow-up."
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {counters.map((counter) => (
            <div key={counter.label} className={`${counter.tone} rounded-2xl p-5 shadow-sm`}>
              <p className="text-2xl font-bold text-foreground">{counter.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                {counter.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications by role or location"
                className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-5 text-sm text-foreground outline-none focus:border-foreground/40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-foreground/40"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </select>
          </div>
        </div>

        {isPending ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-foreground">No applications found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start applying to verified roles and they will appear here instantly.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
            >
              Browse jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((application, index) => {
              const normalizedStatus = String(application.status || "PENDING").toUpperCase();
              const status = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.PENDING;
              return (
                <motion.div
                  key={application.id}
                  className="rounded-2xl bg-white px-6 py-5 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {application.job?.title || "Job title"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {application.job?.location || "Location"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} />
                          {application.job?.jobType || "Role"}
                        </span>
                        <span>
                          Applied {new Date(application.appliedAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                      {status.icon}
                      {normalizedStatus.charAt(0) + normalizedStatus.slice(1).toLowerCase()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
