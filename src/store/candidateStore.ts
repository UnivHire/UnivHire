import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./authStore";

export interface SavedJobRecord {
  id: string;
  title: string;
  universityName: string;
  location: string;
  jobType: string;
  description: string;
  savedAt: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  headline: string;
  preferredRole: string;
  location: string;
  about: string;
  resumeUrl: string;
  portfolioUrl: string;
  experienceLevel: string;
  availability: string;
  skills: string[];
}

export interface CandidateNotification {
  id: string;
  title: string;
  description: string;
  type: "application" | "job" | "saved" | "system";
  read: boolean;
  createdAt: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface CandidateNotificationSettings {
  applicationUpdates: boolean;
  matchingJobs: boolean;
  savedJobAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export interface CandidatePreferences {
  theme: "light" | "system";
  density: "comfortable" | "compact";
  jobAlertFrequency: "instant" | "daily" | "weekly";
  openToRelocate: boolean;
  profileVisibleToUniversities: boolean;
  minSalaryK: number;
}

interface CandidateState {
  savedJobs: Record<string, SavedJobRecord>;
  profile: CandidateProfile;
  notifications: CandidateNotification[];
  notificationSettings: CandidateNotificationSettings;
  preferences: CandidatePreferences;
  syncFromAuth: (user: AuthUser | null) => void;
  updateProfile: (payload: Partial<CandidateProfile>) => void;
  saveJob: (job: Omit<SavedJobRecord, "savedAt">) => void;
  unsaveJob: (jobId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  updateNotificationSettings: (payload: Partial<CandidateNotificationSettings>) => void;
  updatePreferences: (payload: Partial<CandidatePreferences>) => void;
}

const initialNotifications: CandidateNotification[] = [
  {
    id: "n1",
    title: "Application received",
    description: "Your application for Assistant Professor - CS was successfully submitted.",
    type: "application",
    read: false,
    createdAt: new Date().toISOString(),
    ctaLabel: "View applications",
    ctaHref: "/applications",
  },
  {
    id: "n2",
    title: "New verified jobs added",
    description: "Three new faculty and trainer roles were posted in Delhi and Bangalore.",
    type: "job",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    ctaLabel: "Browse jobs",
    ctaHref: "/dashboard",
  },
  {
    id: "n3",
    title: "Saved jobs reminder",
    description: "Keep your shortlist updated so you can apply before roles close.",
    type: "saved",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ctaLabel: "Open saved jobs",
    ctaHref: "/saved",
  },
];

const defaultProfile: CandidateProfile = {
  name: "",
  email: "",
  phone: "",
  headline: "Aspiring university professional looking for verified opportunities",
  preferredRole: "Faculty",
  location: "India",
  about:
    "I am looking for trusted campus opportunities where I can contribute, grow, and build a meaningful long-term career.",
  resumeUrl: "",
  portfolioUrl: "",
  experienceLevel: "Fresher",
  availability: "Immediately available",
  skills: ["Communication", "Teamwork", "Problem Solving"],
};

const toProfileString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const toProfileSkills = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((skill): skill is string => typeof skill === "string")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return defaultProfile.skills;
};

export function normalizeCandidateProfile(profile?: Partial<CandidateProfile> | null): CandidateProfile {
  const next = { ...defaultProfile, ...(profile || {}) };

  return {
    ...next,
    name: toProfileString(next.name),
    email: toProfileString(next.email),
    phone: toProfileString(next.phone),
    headline: toProfileString(next.headline, defaultProfile.headline),
    preferredRole: toProfileString(next.preferredRole, defaultProfile.preferredRole),
    location: toProfileString(next.location, defaultProfile.location),
    about: toProfileString(next.about, defaultProfile.about),
    resumeUrl: toProfileString(next.resumeUrl),
    portfolioUrl: toProfileString(next.portfolioUrl),
    experienceLevel: toProfileString(next.experienceLevel, defaultProfile.experienceLevel),
    availability: toProfileString(next.availability, defaultProfile.availability),
    skills: toProfileSkills(next.skills),
  };
}

export function serializeCandidateProfile(profile: CandidateProfile) {
  return {
    ...profile,
    skills: profile.skills.join(", "),
  };
}

const defaultNotificationSettings: CandidateNotificationSettings = {
  applicationUpdates: true,
  matchingJobs: true,
  savedJobAlerts: true,
  weeklyDigest: true,
  marketingEmails: false,
};

const defaultPreferences: CandidatePreferences = {
  theme: "light",
  density: "comfortable",
  jobAlertFrequency: "daily",
  openToRelocate: true,
  profileVisibleToUniversities: true,
  minSalaryK: 30,
};

export const useCandidateStore = create<CandidateState>()(
  persist(
    (set) => ({
      savedJobs: {},
      profile: defaultProfile,
      notifications: initialNotifications,
      notificationSettings: defaultNotificationSettings,
      preferences: defaultPreferences,
      syncFromAuth: (user) =>
        set((state) => ({
          profile: normalizeCandidateProfile({
            ...state.profile,
            name: state.profile.name || user?.name || "",
            email: state.profile.email || user?.email || "",
          }),
        })),
      updateProfile: (payload) =>
        set((state) => ({
          profile: normalizeCandidateProfile({ ...state.profile, ...payload }),
        })),
      saveJob: (job) =>
        set((state) => ({
          savedJobs: {
            ...state.savedJobs,
            [job.id]: {
              ...job,
              savedAt: new Date().toISOString(),
            },
          },
        })),
      unsaveJob: (jobId) =>
        set((state) => {
          const next = { ...state.savedJobs };
          delete next[jobId];
          return { savedJobs: next };
        }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
        })),
      updateNotificationSettings: (payload) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...payload },
        })),
      updatePreferences: (payload) =>
        set((state) => ({
          preferences: { ...state.preferences, ...payload },
        })),
    }),
    {
      name: "univhire-candidate",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CandidateState> | undefined;

        return {
          ...currentState,
          savedJobs: persisted?.savedJobs || currentState.savedJobs,
          notifications: persisted?.notifications || currentState.notifications,
          profile: normalizeCandidateProfile(persisted?.profile),
          notificationSettings: {
            ...defaultNotificationSettings,
            ...persisted?.notificationSettings,
          },
          preferences: {
            ...defaultPreferences,
            ...persisted?.preferences,
          },
        };
      },
    }
  )
);
