import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { InvitePage } from "./pages/InvitePage";
import { DashboardPage } from "./pages/candidate/DashboardPage";
import { JobDetailPage } from "./pages/candidate/JobDetailPage";
import { ApplicationsPage } from "./pages/candidate/ApplicationsPage";
import { SavedPage } from "./pages/candidate/SavedPage";
import { HRDashboardPage } from "./pages/hr/HRDashboardPage";
import { PostJobPage } from "./pages/hr/PostJobPage";
import { HRJobsPage } from "./pages/hr/HRJobsPage";
import { HRApplicationsPage } from "./pages/hr/HRApplicationsPage";
import { HRApplicationDetailPage } from "./pages/hr/HRApplicationDetailPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ──────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* ── Candidate (protected) ───────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="candidate"><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute requiredRole="candidate"><JobDetailPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute requiredRole="candidate"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute requiredRole="candidate"><SavedPage /></ProtectedRoute>} />

        {/* ── HR (protected) ──────────────────────── */}
        <Route path="/hr/dashboard" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRDashboardPage /></ProtectedRoute>} />
        <Route path="/hr/post-job" element={<ProtectedRoute requiredRole={["hr", "admin"]}><PostJobPage /></ProtectedRoute>} />
        <Route path="/hr/jobs" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRJobsPage /></ProtectedRoute>} />
        <Route path="/hr/applications" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRApplicationsPage /></ProtectedRoute>} />
        <Route path="/hr/applications/:id" element={<ProtectedRoute requiredRole={["hr", "admin"]}><HRApplicationDetailPage /></ProtectedRoute>} />

        {/* ── Admin (protected) ───────────────────── */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />

        {/* ── Fallback ────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;