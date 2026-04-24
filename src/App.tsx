import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { InvitePage } from "./pages/InvitePage";
import { CandidateDashboardPage } from "./pages/candidate/CandidateDashboardPage";
import { CandidateJobDetailPage } from "./pages/candidate/CandidateJobDetailPage";
import { CandidateApplicationsPage } from "./pages/candidate/CandidateApplicationsPage";
import { CandidateSavedPage } from "./pages/candidate/CandidateSavedPage";
import { CandidateProfilePage } from "./pages/candidate/CandidateProfilePage";
import { CandidateSettingsPage } from "./pages/candidate/CandidateSettingsPage";
import { CandidateNotificationsPage } from "./pages/candidate/CandidateNotificationsPage";
import { HRDashboardPage } from "./pages/hr/HRDashboardPage";
import { PostJobPage } from "./pages/hr/PostJobPage";
import { HRJobsPage } from "./pages/hr/HRJobsPage";
import { HRApplicationsPage } from "./pages/hr/HRApplicationsPage";
import { HRApplicationDetailPage } from "./pages/hr/HRApplicationDetailPage";
import { HRProfilePage } from "./pages/hr/HRProfilePage";
import { HRSettingsPage } from "./pages/hr/HRSettingsPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./store/authStore";

function RootRoute() {
  const { token, role } = useAuthStore();

  if (!token) {
    return <LandingPage />;
  }

  const destination =
    role === "candidate"
      ? "/dashboard"
      : role === "hr"
      ? "/hr/dashboard"
      : "/admin";

  return <Navigate to={destination} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ──────────────────────────────── */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* ── Candidate (protected) ───────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="candidate"><CandidateDashboardPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute requiredRole="candidate"><CandidateJobDetailPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute requiredRole="candidate"><CandidateApplicationsPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute requiredRole="candidate"><CandidateSavedPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="candidate"><CandidateProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute requiredRole="candidate"><CandidateSettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute requiredRole="candidate"><CandidateNotificationsPage /></ProtectedRoute>} />

        {/* ── HR (protected) ──────────────────────── */}
        <Route path="/hr/dashboard" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRDashboardPage /></ProtectedRoute>} />
        <Route path="/hr/post-job" element={<ProtectedRoute requiredRole={["hr", "admin"]}><PostJobPage /></ProtectedRoute>} />
        <Route path="/hr/jobs" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRJobsPage /></ProtectedRoute>} />
        <Route path="/hr/applications" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRApplicationsPage /></ProtectedRoute>} />
        <Route path="/hr/applications/:id" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRApplicationDetailPage /></ProtectedRoute>} />
        <Route path="/hr/profile" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRProfilePage /></ProtectedRoute>} />
        <Route path="/hr/settings" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRSettingsPage /></ProtectedRoute>} />

        {/* ── Admin (protected) ───────────────────── */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />

        {/* ── Fallback ────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
