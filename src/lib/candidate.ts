import { API_BASE } from "./api";
import type { SavedJobRecord } from "../store/candidateStore";

export interface CandidateJob {
  id: string;
  title: string;
  universityName: string;
  category: string;
  location: string;
  description: string;
  isVerified: boolean;
  status?: string;
  createdAt?: string;
  salaryMinK?: number | null;
  salaryMaxK?: number | null;
  experience?: string;
  experienceYears?: number;
  workplaceType?: string;
  seniorityLevel?: string;
  requiredSkills?: string[];
  industries?: string[];
  jobFunctions?: string[];
  screeningQuestions?: Array<{ type: string; mustHave?: boolean }>;
  applicationMode?: string;
  applicationEmail?: string;
  externalApplyUrl?: string;
  requireResume?: boolean;
  organizationLogoUrl?: string;
  cardTheme?: string;
}

function splitCsv(raw: unknown): string[] {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScreening(raw: unknown): Array<{ type: string; mustHave?: boolean }> {
  const source = String(raw || "").trim();
  if (!source) return [];
  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((q: any) => ({ type: String(q?.type || "").trim(), mustHave: Boolean(q?.mustHave) }))
      .filter((q) => q.type);
  } catch {
    return [];
  }
}

export const FALLBACK_CANDIDATE_JOBS: CandidateJob[] = [
  {
    id: "f1",
    title: "Assistant Professor - CS",
    universityName: "North Valley University",
    category: "Faculty",
    location: "Delhi",
    description: "Teach computing subjects and mentor undergraduate batches.",
    isVerified: true,
    status: "OPEN",
  },
  {
    id: "f2",
    title: "Campus Security Supervisor",
    universityName: "Shivtara University",
    category: "Security",
    location: "Lucknow, UP",
    description: "Coordinate security teams and handle shift planning.",
    isVerified: true,
    status: "OPEN",
  },
  {
    id: "f3",
    title: "Administrative Driver",
    universityName: "Maharashtra Central",
    category: "Driver",
    location: "Pune, MH",
    description: "Support official transport duties for campus operations.",
    isVerified: true,
    status: "OPEN",
  },
  {
    id: "f4",
    title: "Lab Technician",
    universityName: "Delhi Science College",
    category: "Trainer",
    location: "Delhi",
    description: "Maintain lab equipment and coordinate practical sessions.",
    isVerified: true,
    status: "OPEN",
  },
  {
    id: "f5",
    title: "Head Groundskeeper",
    universityName: "Rajasthan Central Uni",
    category: "Operations",
    location: "Jaipur",
    description: "Manage outdoor maintenance and campus grounds operations.",
    isVerified: true,
    status: "OPEN",
  },
  {
    id: "f6",
    title: "Senior UX Researcher",
    universityName: "IIT Affiliated Campus",
    category: "Faculty",
    location: "Bangalore",
    description: "Lead design research for student product initiatives.",
    isVerified: true,
    status: "OPEN",
  },
];

export function normalizeCandidateJob(raw: any): CandidateJob {
  const rawLogo = raw?.organizationLogoUrl ? String(raw.organizationLogoUrl) : "";
  const normalizedLogo = rawLogo.startsWith("http")
    ? rawLogo
    : rawLogo
    ? `${API_BASE}${rawLogo}`
    : "";

  return {
    id: String(raw?.id || ""),
    title: String(raw?.title || "Untitled role"),
    universityName: String(raw?.organizationName || raw?.hr?.university || raw?.hr?.name || raw?.universityName || "Verified University"),
    category: String(raw?.jobType || raw?.category || "General"),
    location: String(raw?.location || "Location not specified"),
    description: String(raw?.description || "No description available yet."),
    isVerified: raw?.isVerified !== false,
    status: String(raw?.status || "OPEN"),
    createdAt: raw?.createdAt,
    salaryMinK: typeof raw?.salaryMinK === "number" ? raw.salaryMinK : null,
    salaryMaxK: typeof raw?.salaryMaxK === "number" ? raw.salaryMaxK : null,
    experience: raw?.experience ? String(raw.experience) : "",
    experienceYears: typeof raw?.experienceYears === "number" ? raw.experienceYears : 0,
    workplaceType: raw?.workplaceType ? String(raw.workplaceType) : "",
    seniorityLevel: raw?.seniorityLevel ? String(raw.seniorityLevel) : "",
    requiredSkills: splitCsv(raw?.requiredSkills),
    industries: splitCsv(raw?.industry),
    jobFunctions: splitCsv(raw?.jobFunction),
    screeningQuestions: parseScreening(raw?.screeningQuestions),
    applicationMode: raw?.applicationMode ? String(raw.applicationMode) : "",
    applicationEmail: raw?.applicationEmail ? String(raw.applicationEmail) : "",
    externalApplyUrl: raw?.externalApplyUrl ? String(raw.externalApplyUrl) : "",
    requireResume: typeof raw?.requireResume === "boolean" ? raw.requireResume : true,
    organizationLogoUrl: normalizedLogo,
    cardTheme: raw?.cardTheme ? String(raw.cardTheme) : "",
  };
}

const THEME_CLASS_BY_KEY: Record<string, string> = {
  peach: "card-peach",
  mint: "card-mint",
  lavender: "card-lavender",
  sky: "card-sky",
  pink: "card-pink",
  cream: "card-cream",
};

const THEME_KEYS = Object.keys(THEME_CLASS_BY_KEY);

export function resolveJobThemeClass(job: CandidateJob): string {
  const selected = (job.cardTheme || "").toLowerCase();
  if (selected in THEME_CLASS_BY_KEY) {
    return THEME_CLASS_BY_KEY[selected];
  }

  const base = job.id || job.title || "job";
  const hash = Array.from(base).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const key = THEME_KEYS[hash % THEME_KEYS.length];
  return THEME_CLASS_BY_KEY[key];
}

export function toSavedJobRecord(job: CandidateJob): Omit<SavedJobRecord, "savedAt"> {
  return {
    id: job.id,
    title: job.title,
    universityName: job.universityName,
    location: job.location,
    jobType: job.category,
    description: job.description,
  };
}

export function formatSalaryRange(min?: number | null, max?: number | null) {
  if (typeof min !== "number" || typeof max !== "number") return "Salary not disclosed";
  const maxLabel = max >= 100 ? `${(max / 100).toFixed(1).replace(".0", "")}L` : `${max}k`;
  return `INR ${min}k - ${maxLabel} / month`;
}

export function formatRelativeDate(iso?: string) {
  if (!iso) return "Recently added";
  const diffHours = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
