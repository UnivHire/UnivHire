import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, Briefcase, CheckCheck, Search, Trash2 } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { CandidatePageHeader } from "../../components/candidate/CandidatePageHeader";
import { useCandidateStore } from "../../store/candidateStore";

const TYPE_STYLES = {
  application: "bg-emerald-100 text-emerald-700",
  job: "bg-secondary/15 text-secondary",
  saved: "bg-amber-100 text-amber-700",
  system: "bg-foreground/10 text-foreground",
} as const;

export function CandidateNotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, markNotificationRead, removeNotification } =
    useCandidateStore();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <div className="w-full px-6 py-10 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <CandidatePageHeader
          eyebrow="Updates"
          title="Notifications"
          description="Stay on top of application progress, matching jobs, and shortlist reminders without losing track."
          actions={
            <>
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-85"
              >
                Notification settings
              </button>
            </>
          }
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card-peach rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
              Total notifications
            </p>
          </div>
          <div className="card-mint rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
              Unread updates
            </p>
          </div>
          <div className="card-lavender rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-foreground">
              {notifications.filter((item) => item.type === "job").length}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
              Job alerts
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-lg font-bold text-foreground">No notifications yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Once your applications move or new matching roles arrive, updates will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white px-5 py-5 shadow-sm transition ${
                  notification.read ? "border-border" : "border-secondary/30"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-foreground">
                      {notification.type === "application" ? (
                        <Briefcase size={18} />
                      ) : notification.type === "job" ? (
                        <Search size={18} />
                      ) : (
                        <BellRing size={18} />
                      )}
                    </div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{notification.title}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLES[notification.type]}`}
                        >
                          {notification.type}
                        </span>
                        {!notification.read ? (
                          <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                            New
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {notification.ctaHref ? (
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationRead(notification.id);
                          navigate(notification.ctaHref || "/dashboard");
                        }}
                        className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
                      >
                        {notification.ctaLabel || "Open"}
                      </button>
                    ) : null}
                    {!notification.read ? (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(notification.id)}
                        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
                      >
                        Mark read
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeNotification(notification.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
