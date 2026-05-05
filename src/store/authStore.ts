import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "candidate" | "hr" | "admin" | "admin_hr" | "sub_hr";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleType?: string;
  university?: string;
}

export function normalizeRole(role: string | null | undefined): UserRole {
  const raw = String(role || "").toLowerCase();
  if (raw === "admin_hr") return "admin_hr";
  if (raw === "sub_hr") return "sub_hr";
  if (raw === "admin") return "admin";
  if (raw === "hr") return "hr";
  return "candidate";
}

export function isHrRole(role: UserRole | null | undefined) {
  return role === "hr" || role === "admin_hr" || role === "sub_hr" || role === "admin";
}

export function canWriteHr(role: UserRole | null | undefined) {
  return role === "hr" || role === "admin_hr" || role === "admin";
}

interface AuthState {
  token: string | null;
  role: UserRole | null;
  user: AuthUser | null;
  setAuth: (token: string, role: UserRole, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      setAuth: (token, role, user) => set({ token, role, user }),
      logout: () => set({ token: null, role: null, user: null }),
    }),
    { name: "univhire-auth" }
  )
);