import { useNavigate } from "react-router-dom";
import { Bookmark, ArrowLeft } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";

export function SavedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <h1 className="mb-8 text-2xl font-bold text-foreground">Saved Jobs</h1>
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <Bookmark size={40} className="mx-auto mb-4 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">No saved jobs yet. Bookmark jobs from the dashboard to see them here.</p>
          <button type="button" onClick={() => navigate("/dashboard")} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition">Browse Jobs</button>
        </div>
      </div>
    </div>
  );
}