import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Search,
  Sparkles,
  ThumbsUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { SmartNavbar } from "../../components/SmartNavbar";
import { useAuthStore } from "../../store/authStore";
import { useCandidateStore } from "../../store/candidateStore";

const COMMUNITY_POSTS = [
  {
    role: "Assistant Professor",
    meta: "Faculty hiring",
    title: "How should I prepare for a university demo lecture?",
    body:
      "I have a 20-minute teaching demo next week. What should I prioritize: subject depth, classroom interaction, or presentation flow?",
    likes: 18,
    comments: 7,
    tags: ["Interview Tips", "Faculty"],
  },
  {
    role: "Campus Operations",
    meta: "Career switch",
    title: "Moving from school administration to university operations",
    body:
      "I have four years of admin experience in a private school. Has anyone moved into university operations or student services?",
    likes: 12,
    comments: 5,
    tags: ["Operations", "Career Pivot"],
  },
  {
    role: "Trainer",
    meta: "Salary discussion",
    title: "What is a fair monthly pay range for a technical trainer role?",
    body:
      "The role includes lab sessions, student mentoring, and placement training. Curious how others evaluate this kind of offer.",
    likes: 23,
    comments: 11,
    tags: ["Salary", "Trainer"],
  },
];

const COMMUNITY_GROUPS = [
  { title: "Faculty Lounge", desc: "Teaching demos, research roles, and classroom questions.", members: "18k" },
  { title: "Campus Operations", desc: "Admin, facilities, transport, and student services roles.", members: "9k" },
  { title: "Interview Prep", desc: "Share interview rounds, assignments, and follow-up tips.", members: "24k" },
  { title: "Job Referrals", desc: "Campus openings, referral requests, and hiring updates.", members: "31k" },
];

const TOPICS = ["Faculty", "Interview Tips", "Salary", "Operations", "Trainer", "Career Pivot", "Campus Life"];

export function CandidateCommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, syncFromAuth } = useCandidateStore();

  useEffect(() => {
    syncFromAuth(user || null);
  }, [syncFromAuth, user]);

  const firstName = user?.name?.split(" ")[0] || profile.name?.split(" ")[0] || "candidate";

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />

      <main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8">
        <motion.section
          className="mb-6 overflow-hidden rounded-[26px] bg-foreground px-6 py-6 text-white shadow-sm md:px-7"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Candidate Community
              </p>
              <h1 className="text-2xl font-bold leading-tight text-white md:text-[2rem]">
                Welcome back, <span className="text-secondary">{firstName}</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Join real talk about campus careers, interviews, salaries, and verified university opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-85"
            >
              Browse jobs <ArrowUpRight size={15} />
            </button>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="min-w-0 space-y-6">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search discussions, roles, or communities"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none focus:border-foreground/40"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Conversations for you</h2>
                  <p className="text-sm text-muted-foreground">Clean, practical questions from other candidates.</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
                >
                  Start a post
                </button>
              </div>

              <div className="space-y-3">
                {COMMUNITY_POSTS.map((post, index) => (
                  <motion.article
                    key={post.title}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-foreground">
                        <GraduationCap size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">{post.role}</p>
                        <p className="text-xs text-muted-foreground">{post.meta}</p>
                      </div>
                    </div>
                    <h3 className="text-base font-bold leading-snug text-foreground">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <ThumbsUp size={13} /> {post.likes}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle size={13} /> {post.comments} comments
                      </span>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-bold text-foreground">Popular communities</h2>
                <p className="text-sm text-muted-foreground">Find people discussing the roles you care about.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {COMMUNITY_GROUPS.map((group) => (
                  <article key={group.title} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background text-foreground">
                      <Users size={18} />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{group.title}</h3>
                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">{group.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-foreground/60">
                        {group.members} members
                      </span>
                      <button
                        type="button"
                        className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-white transition hover:opacity-85"
                      >
                        Join
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Briefcase size={18} />
              </div>
              <h2 className="text-base font-bold text-foreground">Browse verified jobs</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Search openings from universities and compare job details in one focused view.
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-85"
              >
                Browse jobs <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-foreground">Career snapshot</h2>
              <InfoRow icon={<Building2 size={15} />} label="Target role" value={profile.preferredRole || "Faculty"} />
              <InfoRow icon={<Sparkles size={15} />} label="Experience" value={profile.experienceLevel || "Fresher"} />
              <InfoRow icon={<CheckCircle2 size={15} />} label="Availability" value={profile.availability || "Immediately available"} />
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="mt-4 text-sm font-bold text-secondary"
              >
                Complete profile
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center gap-3 last:mb-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
