"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  Settings,
  UploadCloud,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import type { AdminSettings, AppUser, Department, NewsletterIssue, Submission, SubmissionStatus } from "@/lib/types";

type Bootstrap = {
  departments: Department[];
  issues: NewsletterIssue[];
  settings: AdminSettings;
  generatedPdfs: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
};

const emptyImages = Array.from({ length: 4 }, (_, index) => ({
  id: `image-${index + 1}`,
  url: "",
  caption: ""
}));

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<"submit" | "review" | "settings">("submit");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("mypal-user");
    if (!raw) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(raw) as AppUser;
    setUser(parsed);
    setActiveTab(parsed.role === "admin" ? "review" : "submit");
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    async function load() {
      const [bootResponse, submissionsResponse] = await Promise.all([
        fetch("/api/bootstrap"),
        fetch(`/api/submissions?userId=${currentUser.id}&role=${currentUser.role}`)
      ]);
      setBootstrap(await bootResponse.json());
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions);
    }

    load();
  }, [user]);

  const issue = bootstrap?.issues[0];
  const department = useMemo(() => {
    if (!bootstrap || !user) return null;
    return bootstrap.departments.find((item) => item.id === user.departmentId) ?? bootstrap.departments[1];
  }, [bootstrap, user]);

  function logout() {
    localStorage.removeItem("mypal-user");
    router.push("/login");
  }

  async function refreshSubmissions() {
    if (!user) return;
    const response = await fetch(`/api/submissions?userId=${user.id}&role=${user.role}`);
    const data = await response.json();
    setSubmissions(data.submissions);
  }

  async function patchSubmission(id: string, patch: Partial<Submission>) {
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await refreshSubmissions();
  }

  async function generatePdf() {
    if (!issue) return;
    setGenerating(true);
    setMessage("");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: issue.id })
    });
    const data = await response.json();
    setGenerating(false);
    if (!response.ok) {
      setMessage(data.message ?? "Could not generate PDF.");
      return;
    }
    setMessage("PDF generated successfully.");
    window.open(data.pdf.fileUrl, "_blank");
    const bootResponse = await fetch("/api/bootstrap");
    setBootstrap(await bootResponse.json());
  }

  if (!user || !bootstrap || !issue) {
    return <main className="grid min-h-screen place-items-center bg-mypal-cloud font-bold text-mypal-deep">Loading dashboard...</main>;
  }

  const admin = user.role === "admin";

  return (
    <main className="min-h-screen bg-mypal-cloud">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-mypal-orange px-3 py-2 text-xl font-black text-white">myPAL</div>
            <div>
              <h1 className="text-xl font-black text-mypal-deep">Newsletter Generator</h1>
              <p className="text-sm text-slate-500">{issue.month} {issue.year} • Issue {issue.issueNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/preview" target="_blank" className="hidden items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-bold text-mypal-deep md:flex">
              <Eye size={16} /> Preview
            </a>
            {admin ? (
              <button onClick={generatePdf} disabled={generating} className="flex items-center gap-2 rounded bg-mypal-orange px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                <Download size={16} /> {generating ? "Generating..." : "Generate PDF"}
              </button>
            ) : null}
            <button onClick={logout} className="rounded border border-slate-200 p-2 text-slate-600" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg bg-white p-3 shadow-soft">
          <NavButton active={activeTab === "submit"} icon={<UploadCloud size={18} />} label="Add Monthly Update" onClick={() => setActiveTab("submit")} />
          {admin ? <NavButton active={activeTab === "review"} icon={<LayoutDashboard size={18} />} label="Review Workflow" onClick={() => setActiveTab("review")} /> : null}
          {admin ? <NavButton active={activeTab === "settings"} icon={<Settings size={18} />} label="Admin Settings" onClick={() => setActiveTab("settings")} /> : null}
          <div className="mt-4 rounded bg-mypal-cloud p-3 text-sm">
            <p className="font-bold text-mypal-deep">{user.name}</p>
            <p className="text-slate-600">{user.role === "admin" ? "Admin / Marketing Manager" : department?.name}</p>
          </div>
        </aside>

        <section>
          {message ? <p className="mb-4 rounded bg-white px-4 py-3 text-sm font-bold text-mypal-deep shadow-soft">{message}</p> : null}
          {activeTab === "submit" ? (
            <SubmissionForm user={user} issue={issue} department={department} submissions={submissions} onSaved={refreshSubmissions} />
          ) : null}
          {activeTab === "review" && admin ? (
            <ReviewBoard submissions={submissions} onPatch={patchSubmission} generatedPdfs={bootstrap.generatedPdfs} />
          ) : null}
          {activeTab === "settings" && admin ? (
            <SettingsForm settings={bootstrap.settings} onSaved={async () => setBootstrap(await (await fetch("/api/bootstrap")).json())} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded px-3 py-3 text-left text-sm font-bold ${active ? "bg-mypal-orange text-white" : "text-slate-700 hover:bg-mypal-cloud"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function SubmissionForm({
  user,
  issue,
  department,
  submissions,
  onSaved
}: {
  user: AppUser;
  issue: NewsletterIssue;
  department: Department | null;
  submissions: Submission[];
  onSaved: () => Promise<void>;
}) {
  const existing = submissions.find((item) => item.departmentId === department?.id) ?? submissions[0];
  const [form, setForm] = useState({
    id: existing?.id,
    sectionTitle: existing?.sectionTitle ?? department?.sectionTitle ?? "",
    headline: existing?.headline ?? "",
    intro: existing?.intro ?? "",
    bullets: existing?.bullets?.join("\n") ?? "",
    metrics: existing?.metrics?.map((metric) => `${metric.label}: ${metric.value}`).join("\n") ?? "Students reached: \nLeads generated: \nAdmissions: ",
    images: existing?.images?.length ? existing.images : emptyImages,
    status: existing?.status ?? "draft"
  });
  const [error, setError] = useState("");

  async function submit(event: FormEvent, status: SubmissionStatus) {
    event.preventDefault();
    setError("");
    const payload = {
      id: form.id,
      issueId: issue.id,
      userId: user.id,
      departmentId: department?.id ?? "custom",
      sectionTitle: form.sectionTitle,
      headline: form.headline,
      intro: form.intro,
      bullets: form.bullets.split("\n").map((item) => item.trim()).filter(Boolean),
      metrics: form.metrics
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [label, ...value] = item.split(":");
          return { label: label.trim(), value: value.join(":").trim() || "0" };
        }),
      images: form.images.filter((image) => image.url && image.caption),
      status,
      visible: true,
      sortOrder: department?.sortOrder ?? 10
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError("Please include an intro, 3 bullet points, and at least 4 images with captions.");
      return;
    }

    const data = await response.json();
    setForm((current) => ({ ...current, id: data.submission.id, status: data.submission.status }));
    await onSaved();
  }

  return (
    <form className="rounded-lg bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-mypal-orange">{department?.name ?? "Team"}</p>
          <h2 className="text-3xl font-black text-mypal-deep">Monthly Update</h2>
        </div>
        <StatusBadge status={form.status as SubmissionStatus} />
      </div>

      <Field label="Section title" value={form.sectionTitle} onChange={(value) => setForm({ ...form, sectionTitle: value })} />
      <Field label="Main update headline" value={form.headline} onChange={(value) => setForm({ ...form, headline: value })} />
      <TextArea label="Short description / introduction" value={form.intro} onChange={(value) => setForm({ ...form, intro: value })} rows={4} />
      <TextArea label="Bullet-point achievements" hint="One bullet per line, minimum 3." value={form.bullets} onChange={(value) => setForm({ ...form, bullets: value })} rows={6} />
      <TextArea label="Metrics" hint="One per line, format: Students reached: 1240" value={form.metrics} onChange={(value) => setForm({ ...form, metrics: value })} rows={4} />

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 font-bold text-mypal-deep"><ImagePlus size={18} /> Images and captions</div>
        <div className="grid gap-4 md:grid-cols-2">
          {form.images.map((image, index) => (
            <div key={image.id ?? index} className="rounded border border-slate-200 p-4">
              <input
                value={image.url}
                onChange={(event) => {
                  const next = [...form.images];
                  next[index] = { ...image, url: event.target.value };
                  setForm({ ...form, images: next });
                }}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                placeholder="Image URL"
              />
              <input
                value={image.caption}
                onChange={(event) => {
                  const next = [...form.images];
                  next[index] = { ...image, caption: event.target.value };
                  setForm({ ...form, images: next });
                }}
                className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm"
                placeholder="Caption"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, images: [...form.images, { id: `image-${Date.now()}`, url: "", caption: "" }] })}
          className="mt-3 flex items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-bold text-mypal-deep"
        >
          <Plus size={16} /> Add optional image
        </button>
      </div>

      {error ? <p className="mt-4 rounded bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <button onClick={(event) => submit(event, "draft")} className="flex items-center gap-2 rounded border border-slate-200 px-5 py-3 font-bold text-mypal-deep">
          <Save size={18} /> Save Draft
        </button>
        <button onClick={(event) => submit(event, "submitted")} className="flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white">
          <UploadCloud size={18} /> Submit for Review
        </button>
      </div>
    </form>
  );
}

function ReviewBoard({
  submissions,
  onPatch,
  generatedPdfs
}: {
  submissions: Submission[];
  onPatch: (id: string, patch: Partial<Submission>) => Promise<void>;
  generatedPdfs: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
}) {
  const buckets: SubmissionStatus[] = ["submitted", "approved", "rejected", "draft", "published"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {buckets.slice(0, 4).map((status) => (
          <div key={status} className="rounded-lg bg-white p-4 shadow-soft">
            <p className="text-sm font-bold capitalize text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-black text-mypal-deep">{submissions.filter((item) => item.status === status).length}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-mypal-deep">All Submissions</h2>
          <a href="/preview" target="_blank" className="flex items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-bold text-mypal-deep">
            <FileText size={16} /> Preview Newsletter
          </a>
        </div>
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={submission.status} />
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <input type="checkbox" checked={submission.visible} onChange={(event) => onPatch(submission.id, { visible: event.target.checked })} />
                      Show
                    </label>
                  </div>
                  <h3 className="mt-3 text-xl font-black text-mypal-deep">{submission.sectionTitle}</h3>
                  <p className="mt-1 font-semibold text-slate-700">{submission.headline}</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{submission.intro}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onPatch(submission.id, { status: "approved" })} className="rounded bg-emerald-600 p-2 text-white" aria-label="Approve">
                    <CheckCircle2 size={18} />
                  </button>
                  <button onClick={() => onPatch(submission.id, { status: "rejected" })} className="rounded bg-rose-600 p-2 text-white" aria-label="Reject">
                    <XCircle size={18} />
                  </button>
                  <input
                    type="number"
                    value={submission.sortOrder}
                    onChange={(event) => onPatch(submission.id, { sortOrder: Number(event.target.value) })}
                    className="w-16 rounded border border-slate-200 px-2 text-sm"
                    aria-label="Sort order"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-mypal-deep">Generated PDFs</h2>
        <div className="mt-3 space-y-2">
          {generatedPdfs.length ? generatedPdfs.map((pdf) => (
            <a key={pdf.id} href={pdf.fileUrl} target="_blank" className="flex items-center justify-between rounded border border-slate-200 px-4 py-3 text-sm font-bold text-mypal-deep">
              {pdf.fileName}
              <Download size={16} />
            </a>
          )) : <p className="text-sm text-slate-500">No PDFs generated yet.</p>}
        </div>
      </div>
    </div>
  );
}

function SettingsForm({ settings, onSaved }: { settings: AdminSettings; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaved(true);
    await onSaved();
  }

  return (
    <form onSubmit={save} className="rounded-lg bg-white p-6 shadow-soft">
      <h2 className="text-3xl font-black text-mypal-deep">Admin Settings</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company logo URL" value={form.companyLogoUrl} onChange={(value) => setForm({ ...form, companyLogoUrl: value })} />
        <Field label="Newsletter title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <Field label="Footer text" value={form.footerText} onChange={(value) => setForm({ ...form, footerText: value })} />
        <Field label="Website link" value={form.websiteUrl} onChange={(value) => setForm({ ...form, websiteUrl: value })} />
        <Field label="Social media handle" value={form.socialHandle} onChange={(value) => setForm({ ...form, socialHandle: value })} />
        <Field label="QR code image URL" value={form.qrCodeUrl} onChange={(value) => setForm({ ...form, qrCodeUrl: value })} />
        <Field label="Primary brand color" value={form.brandPrimary} onChange={(value) => setForm({ ...form, brandPrimary: value })} />
        <Field label="Secondary brand color" value={form.brandSecondary} onChange={(value) => setForm({ ...form, brandSecondary: value })} />
      </div>

      <h3 className="mt-8 text-xl font-black text-mypal-deep">Leadership Profile</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" value={form.leadership.name} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, name: value } })} />
        <Field label="Designation" value={form.leadership.designation} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, designation: value } })} />
        <Field label="Qualification" value={form.leadership.qualification} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, qualification: value } })} />
        <Field label="Profile photo URL" value={form.leadership.photoUrl} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, photoUrl: value } })} />
      </div>
      <TextArea label="Monthly message" value={form.leadership.message} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, message: value } })} rows={5} />

      {saved ? <p className="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Settings saved.</p> : null}
      <button className="mt-6 flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white">
        <Save size={18} /> Save Settings
      </button>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-slate-200 px-3 py-3 outline-mypal-orange" />
    </label>
  );
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {hint ? <span className="ml-2 text-xs text-slate-500">{hint}</span> : null}
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-slate-200 px-3 py-3 outline-mypal-orange" />
    </label>
  );
}
