import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "candidate" | "hr" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleType?: string;
  university?: string;
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