import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { SmartNavbar } from "../../components/SmartNavbar";
import { API_BASE } from "../../lib/api";
import { canWriteHr, useAuthStore } from "../../store/authStore";

const DEFAULT_TOKENS = ["{{candidateName}}", "{{jobTitle}}", "{{status}}"];

export function HREmailTemplatesPage() {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();
  const canWrite = canWriteHr(role);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [form, setForm] = useState({ id: "", name: "", subject: "", body: "", type: "CUSTOM" });

  const loadTemplates = async () => {
    if (!token) return;
    setIsPending(true);
    try {
      const response = await fetch(`${API_BASE}/api/hr/email-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch templates");
      setTemplates(data || []);
    } catch {
      setTemplates([]);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [token]);

  const submitTemplate = async () => {
    if (!token) return;
    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      type: form.type || "CUSTOM",
    };
    if (!payload.name || !payload.subject || !payload.body) return;

    const isEdit = Boolean(form.id);
    const response = await fetch(`${API_BASE}/api/hr/email-templates${isEdit ? `/${form.id}` : ""}`, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    setForm({ id: "", name: "", subject: "", body: "", type: "CUSTOM" });
    loadTemplates();
  };

  const startEdit = (template: any) => {
    setForm({
      id: template.id,
      name: template.name || "",
      subject: template.subject || "",
      body: template.body || "",
      type: template.type || "CUSTOM",
    });
  };

  const removeTemplate = async (templateId: string) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/hr/email-templates/${templateId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    loadTemplates();
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartNavbar />
      <div className="w-full px-6 py-10 md:px-10">
        <button type="button" onClick={() => navigate("/hr/dashboard")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
            <p className="text-sm text-muted-foreground">Use tokens like {DEFAULT_TOKENS.join(", ")}.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {isPending && <div className="h-24 rounded-xl bg-muted animate-pulse" />}
            {!isPending && templates.length === 0 && (
              <p className="text-sm text-muted-foreground">No templates yet.</p>
            )}
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(template)}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-background"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={!canWrite}
                      onClick={() => removeTemplate(template.id)}
                      className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">{form.id ? "Edit template" : "New template"}</h2>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Template name"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                disabled={!canWrite}
              />
              <input
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                disabled={!canWrite}
              />
              <textarea
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Email body"
                rows={6}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
                disabled={!canWrite}
              />
              <button
                type="button"
                onClick={submitTemplate}
                disabled={!canWrite || !form.name.trim() || !form.subject.trim() || !form.body.trim()}
                className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white transition hover:opacity-80 disabled:opacity-60"
              >
                {form.id ? "Update template" : "Create template"}
              </button>
              {!canWrite && (
                <p className="text-xs text-muted-foreground">View-only HR accounts cannot edit templates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
