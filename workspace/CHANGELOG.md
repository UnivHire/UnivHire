<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
## 2026-04-17 (full auth flow)
- Added Zustand authStore (`src/store/authStore.ts`) with persist middleware
- Created SmartNavbar (`src/components/SmartNavbar.tsx`) — auth-aware, replaces old Navbar on landing + portals
- Login page with demo accounts (candidate/hr/admin), role-based redirect + returnUrl support
- Signup page — 4-step wizard (basic info, role cards, location, done) → /dashboard
- InvitePage for HR invite token activation
- Candidate portal: DashboardPage, JobDetailPage (with apply form), ApplicationsPage, SavedPage
- HR portal: HRDashboardPage, PostJobPage, HRJobsPage, HRApplicationsPage
- Admin panel: AdminPage with job verification queue
- ProtectedRoute wrapper for role-based client-side route guarding
- App.tsx rewired with all routes; Hero buttons now smart (auth-aware navigate)
- Files: src/App.tsx, src/pages/*, src/components/SmartNavbar.tsx, src/store/authStore.ts

## 2026-04-17 (navbar black)
## 2026-04-17 (navbar black)
- Changed top navbar bar to pure `bg-black`, filter bar to `bg-[#111111]`, mobile menu to `bg-black`
- File: `src/components/Navbar.tsx`

## 2026-04-17 (full LuckyJob redesign)
- Full UI overhaul across ALL components to match LuckyJob design language
- Navbar: near-black two-bar layout (top nav + filter bar with dropdowns + salary range slider)
- Hero: white card panel with dark promo sidebar, pastel job card grid (JobCard component)
- All dark gradients removed; fonts switched to Inter; pastel palette fully applied
- ProblemSolution, HowItWorks, Features, Stats, StepGrid, DualCTA, Footer, TrustBar all restyled
- DualCTA uses peach + lavender pastel panels; Footer uses lucide Linkedin/Twitter icons

## 2026-04-17 (sdk fix)
- Root cause: SDK version `^0.12.1` was incompatible — pinned to `0.10.0` in `package.json`
- Rewrote Navbar, Hero, Stats, DualCTA, and `src/index.tsx` for clean SDK usage

## 2026-04-17 (prior)
- Fixed "No QueryClient set" by adding `AnimaProvider` in `src/index.tsx` (fix was incomplete due to "..." content in bolt actions)
- Key files: `src/index.tsx`, `src/components/Navbar.tsx`
</changelog>