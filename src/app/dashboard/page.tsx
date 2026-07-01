"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Palette,
  Pencil,
  Plus,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  UserPlus,
  Users,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { NewsletterPreview } from "@/components/newsletter-preview";
import { StatusBadge } from "@/components/status-badge";
import type { AdminSettings, AppNotification, AppUser, Department, EmailOutboxItem, NewsletterIssue, Submission, SubmissionImage, SubmissionStatus } from "@/lib/types";

type Bootstrap = {
  departments: Department[];
  issues: NewsletterIssue[];
  settings: AdminSettings;
  generatedPdfs: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
  users: AppUser[];
  notifications: AppNotification[];
  emailOutbox: EmailOutboxItem[];
};

type Tab = "submit" | "review" | "design" | "planner" | "accounts" | "stakeholders" | "settings" | "profile";

const noteRoles = ["CEO", "CTO", "CBO", "COO", "Other"];

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
  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

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
    void loadAll(user);
  }, [user]);

  async function loadAll(currentUser = user) {
    if (!currentUser) return;
    const [bootResponse, submissionsResponse] = await Promise.all([
      fetch("/api/bootstrap"),
      fetch(`/api/submissions?userId=${currentUser.id}&role=${currentUser.role}`)
    ]);
    setBootstrap(await bootResponse.json());
    const submissionsData = await submissionsResponse.json();
    setSubmissions(submissionsData.submissions);
  }

  const issue = bootstrap?.issues[0];
  const activeDepartment = useMemo(() => {
    if (!bootstrap || !user) return null;
    return bootstrap.departments.find((item) => item.id === user.departmentId) ?? bootstrap.departments.find((item) => item.id === "academic") ?? null;
  }, [bootstrap, user]);

  function logout() {
    localStorage.removeItem("mypal-user");
    router.push("/login");
  }

  async function patchSubmission(id: string, patch: Partial<Submission>) {
    const response = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message ?? "Could not update submission.");
      return;
    }
    setMessage(patch.status ? `Submission ${patch.status}.` : "Submission updated.");
    await loadAll();
  }

  async function patchIssue(patch: Partial<NewsletterIssue>) {
    await fetch(`/api/issues/${issue?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await loadAll();
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
    await loadAll();
  }

  async function publishIssue() {
    if (!issue) return;
    setPublishing(true);
    setMessage("");
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: issue.id })
    });
    const data = await response.json();
    setPublishing(false);
    if (!response.ok) {
      setMessage(data.message ?? "Could not publish newsletter.");
      return;
    }
    setMessage(`Published to ${data.recipients} stakeholder(s).`);
    await loadAll();
  }

  if (!user || !bootstrap || !issue) {
    return <main className="grid min-h-screen place-items-center bg-[#fff6ef] font-bold text-mypal-orange">Loading myPAL workspace...</main>;
  }

  const admin = user.role === "admin";
  const userNotifications = bootstrap.notifications.filter((notification) => notification.userId === user.id);
  const unreadCount = userNotifications.filter((notification) => !notification.read).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe2cd_0,#fff7f0_34%,#fff_100%)] text-[#2a211d]">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/90 px-5 py-4 shadow-[0_18px_60px_rgba(97,48,17,0.07)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-mypal-orange px-4 py-2 text-xl font-black text-white shadow-[0_10px_24px_rgba(244,123,32,0.25)]">myPAL</div>
            <div>
              <h1 className="text-xl font-black text-[#2a211d]">Newsletter Operations Studio</h1>
              <p className="text-sm font-semibold text-orange-700">{issue.month} {issue.year} • Issue {issue.issueNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-black text-orange-800 md:flex">
              <Bell size={16} /> {unreadCount} unread
            </div>
            <a href="/preview" target="_blank" className="hidden items-center gap-2 rounded border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#2a211d] md:flex">
              <Eye size={16} /> Preview
            </a>
            {admin ? (
              <button onClick={generatePdf} disabled={generating} className="flex items-center gap-2 rounded bg-mypal-orange px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                <Download size={16} /> {generating ? "Generating..." : "Export PDF"}
              </button>
            ) : null}
            {admin ? (
              <button onClick={publishIssue} disabled={publishing} className="hidden items-center gap-2 rounded bg-[#2a211d] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 md:flex">
                <Send size={16} /> {publishing ? "Publishing..." : "Publish"}
              </button>
            ) : null}
            <button onClick={logout} className="rounded border border-orange-200 bg-white p-2 text-orange-700" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg border border-orange-100 bg-[#2a211d] p-3 shadow-[0_24px_80px_rgba(42,33,29,0.18)]">
          <NavButton active={activeTab === "submit"} icon={<UploadCloud size={18} />} label="Add Monthly Update" onClick={() => setActiveTab("submit")} />
          {admin ? <NavButton active={activeTab === "review"} icon={<LayoutDashboard size={18} />} label="Review Workflow" onClick={() => setActiveTab("review")} /> : null}
          {admin ? <NavButton active={activeTab === "design"} icon={<Palette size={18} />} label="Design Studio" onClick={() => setActiveTab("design")} /> : null}
          {admin ? <NavButton active={activeTab === "planner"} icon={<CalendarDays size={18} />} label="Issue Planner" onClick={() => setActiveTab("planner")} /> : null}
          {admin ? <NavButton active={activeTab === "accounts"} icon={<Users size={18} />} label="Team Accounts" onClick={() => setActiveTab("accounts")} /> : null}
          {admin ? <NavButton active={activeTab === "stakeholders"} icon={<Send size={18} />} label="Stakeholders" onClick={() => setActiveTab("stakeholders")} /> : null}
          {admin ? <NavButton active={activeTab === "settings"} icon={<Settings size={18} />} label="Brand Settings" onClick={() => setActiveTab("settings")} /> : null}
          <NavButton active={activeTab === "profile"} icon={<User size={18} />} label="Profile" onClick={() => setActiveTab("profile")} />
          <div className="mt-4 rounded border border-white/10 bg-white/10 p-4 text-sm text-white">
            <p className="font-black">{user.name}</p>
            <p className="text-orange-100">{user.role === "admin" ? "Main Admin / Marketing Manager" : activeDepartment?.name}</p>
          </div>
          <NotificationPanel notifications={userNotifications} userId={user.id} onUpdated={() => loadAll()} />
        </aside>

        <section>
          {message ? <p className="mb-4 rounded border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-[#2a211d] shadow-soft">{message}</p> : null}
          {activeTab === "submit" ? (
            <SubmissionForm user={user} issue={issue} departments={bootstrap.departments} defaultDepartment={activeDepartment} submissions={submissions} onSaved={() => loadAll()} />
          ) : null}
          {activeTab === "review" && admin ? (
            <ReviewBoard issue={issue} user={user} submissions={submissions} departments={bootstrap.departments} onPatch={patchSubmission} onCreated={() => loadAll()} generatedPdfs={bootstrap.generatedPdfs} />
          ) : null}
          {activeTab === "design" && admin ? (
            <DesignStudio issue={issue} settings={bootstrap.settings} submissions={submissions} onPatch={patchSubmission} onSettingsSaved={() => loadAll()} />
          ) : null}
          {activeTab === "planner" && admin ? (
            <IssuePlanner issue={issue} users={bootstrap.users} submissions={submissions} departments={bootstrap.departments} emailOutbox={bootstrap.emailOutbox} onSaved={patchIssue} onReminded={() => loadAll()} />
          ) : null}
          {activeTab === "accounts" && admin ? (
            <AccountsPanel users={bootstrap.users} departments={bootstrap.departments} onCreated={() => loadAll()} />
          ) : null}
          {activeTab === "stakeholders" && admin ? (
            <StakeholderPanel settings={bootstrap.settings} onSaved={() => loadAll()} />
          ) : null}
          {activeTab === "settings" && admin ? (
            <SettingsForm settings={bootstrap.settings} onSaved={() => loadAll()} />
          ) : null}
          {activeTab === "profile" ? (
            <ProfileSettings user={user} onUpdated={(nextUser) => setUser(nextUser)} />
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
      className={`mb-2 flex w-full items-center gap-3 rounded px-3 py-3 text-left text-sm font-bold transition ${active ? "bg-mypal-orange text-white shadow-[0_10px_24px_rgba(244,123,32,0.22)]" : "text-orange-50/85 hover:bg-white/10 hover:text-white"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function NotificationPanel({ notifications, userId, onUpdated }: { notifications: AppNotification[]; userId: string; onUpdated: () => Promise<void> }) {
  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    await onUpdated();
  }

  return (
    <div className="mt-4 rounded border border-white/10 bg-white/10 p-4 text-white">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-mypal-orange" />
        <p className="text-sm font-black">Notifications</p>
      </div>
      <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
        {notifications.length ? notifications.slice(0, 6).map((notification) => (
          <button
            key={notification.id}
            onClick={() => markRead(notification.id)}
            className={`w-full rounded p-3 text-left text-xs leading-5 transition ${notification.read ? "bg-white/5 text-orange-50/70" : "bg-white text-[#2a211d] shadow-soft"}`}
          >
            <span className="block font-black">{notification.title}</span>
            <span>{notification.body}</span>
          </button>
        )) : <p className="text-xs leading-5 text-orange-50/70">No alerts yet. Submission confirmations and reminders will appear here.</p>}
      </div>
    </div>
  );
}

function ProfileSettings({ user, onUpdated }: { user: AppUser; onUpdated: (user: AppUser) => void }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, password })
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(data.message ?? "Could not reset password.");
      return;
    }
    const nextUser = { ...user };
    localStorage.setItem("mypal-user", JSON.stringify(nextUser));
    onUpdated(nextUser);
    setPassword("");
    setMessage("Password updated.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={resetPassword} className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <User className="text-mypal-orange" size={22} />
          <h2 className="text-2xl font-black text-[#2a211d]">Profile Settings</h2>
        </div>
        <div className="mt-5 rounded border border-orange-100 bg-orange-50 p-4">
          <p className="font-black text-[#2a211d]">{user.name}</p>
          <p className="text-sm font-semibold text-slate-600">{user.email}</p>
          <p className="mt-2 text-xs font-black uppercase text-orange-700">{user.role}</p>
        </div>
        <Field label="New password" value={password} onChange={setPassword} type="password" />
        <button disabled={saving || password.length < 6} className="mt-5 rounded bg-mypal-orange px-5 py-3 font-bold text-white disabled:opacity-50">
          {saving ? "Updating..." : "Update password"}
        </button>
        {message ? <p className="mt-4 rounded bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800">{message}</p> : null}
      </form>
      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-[#2a211d]">Access</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use this page for personal account settings. Admin-only publishing, design, account, and stakeholder controls remain separated in the sidebar.</p>
      </div>
    </div>
  );
}

function SubmissionForm({
  user,
  issue,
  departments,
  defaultDepartment,
  submissions,
  onSaved
}: {
  user: AppUser;
  issue: NewsletterIssue;
  departments: Department[];
  defaultDepartment: Department | null;
  submissions: Submission[];
  onSaved: () => Promise<void>;
}) {
  const [departmentId, setDepartmentId] = useState(defaultDepartment?.id ?? "academic");
  const selectedDepartment = departments.find((item) => item.id === departmentId) ?? defaultDepartment;
  const existing = submissions.find((item) => item.departmentId === departmentId);
  const [form, setForm] = useState(() => formFromSubmission(existing, selectedDepartment));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingStatus, setSavingStatus] = useState<SubmissionStatus | null>(null);

  useEffect(() => {
    const nextDepartment = departments.find((item) => item.id === departmentId) ?? defaultDepartment;
    const nextExisting = submissions.find((item) => item.departmentId === departmentId);
    setForm(formFromSubmission(nextExisting, nextDepartment));
  }, [departmentId, submissions, departments, defaultDepartment]);

  async function submit(event: FormEvent, status: SubmissionStatus) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingStatus(status);
    const payload = {
      id: form.id,
      issueId: issue.id,
      userId: user.id,
      departmentId,
      sectionTitle: form.sectionTitle,
      headline: form.headline,
      intro: form.intro,
      bullets: form.bullets.split("\n").map((item) => item.trim()).filter(Boolean),
      metrics: form.metrics.split("\n").map((item) => item.trim()).filter(Boolean).map(metricFromLine),
      images: form.images.filter((image) => image.url && image.caption),
      status,
      visible: true,
      sortOrder: selectedDepartment?.sortOrder ?? 10,
      reviewerNote: form.reviewerNote
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setSavingStatus(null);
      setError(formatSubmissionError(data) || "Please include an intro and at least 3 bullet points. Photos are optional.");
      return;
    }

    const data = await response.json();
    setForm((current) => ({ ...current, id: data.submission.id, status: data.submission.status }));
    setSuccess(status === "submitted" ? "Submitted for admin review. A confirmation notification and email have been queued." : "Draft saved.");
    setSavingStatus(null);
    await onSaved();
  }

  function updateImage(index: number, patch: Partial<SubmissionImage>) {
    const next = [...form.images];
    next[index] = { ...next[index], ...patch };
    setForm({ ...form, images: next });
  }

  return (
    <form className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mypal-orange">Team submission</p>
          <h2 className="text-3xl font-black text-[#2a211d]">Monthly Update</h2>
          {form.reviewerNote ? <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">Reviewer note: {form.reviewerNote}</p> : null}
        </div>
        <StatusBadge status={form.status as SubmissionStatus} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField label="Department" value={departmentId} onChange={setDepartmentId} options={teamDepartments(departments).map((item) => ({ label: item.name, value: item.id }))} />
        <Field label="Section title" value={form.sectionTitle} onChange={(value) => setForm({ ...form, sectionTitle: value })} />
      </div>
      <Field label="Main update headline" value={form.headline} onChange={(value) => setForm({ ...form, headline: value })} />
      <TextArea label="Short description / introduction" value={form.intro} onChange={(value) => setForm({ ...form, intro: value })} rows={4} />
      <TextArea label="Bullet-point achievements" hint="One bullet per line, minimum 3." value={form.bullets} onChange={(value) => setForm({ ...form, bullets: value })} rows={6} />
      <TextArea label="Metrics" hint="One per line, format: Students reached: 1240" value={form.metrics} onChange={(value) => setForm({ ...form, metrics: value })} rows={4} />

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 font-black text-[#2a211d]"><ImagePlus size={18} /> Photos and captions</div>
        <div className="grid gap-4 md:grid-cols-2">
          {form.images.map((image, index) => (
            <ImageDropCard key={image.id ?? index} image={image} index={index} onChange={(patch) => updateImage(index, patch)} />
          ))}
        </div>
        <button type="button" onClick={() => setForm({ ...form, images: [...form.images, { id: `image-${Date.now()}`, url: "", caption: "" }] })} className="mt-3 flex items-center gap-2 rounded border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#2a211d]">
          <Plus size={16} /> Add optional photo
        </button>
      </div>

      <SubmissionPreview form={form} department={selectedDepartment} />
      {error ? <p className="mt-4 rounded bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{success}</p> : null}

      <div className="sticky bottom-0 z-10 mt-7 flex flex-wrap gap-3 border-t border-orange-100 bg-white/95 py-4 backdrop-blur">
        <button type="button" disabled={Boolean(savingStatus)} onClick={(event) => submit(event, "draft")} className="flex items-center gap-2 rounded border border-orange-200 bg-white px-5 py-3 font-bold text-[#2a211d] disabled:opacity-60">
          <Save size={18} /> {savingStatus === "draft" ? "Saving..." : "Save Draft"}
        </button>
        <button type="button" disabled={Boolean(savingStatus)} onClick={(event) => submit(event, "submitted")} className="flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white shadow-[0_14px_30px_rgba(244,123,32,0.28)] disabled:opacity-60">
          <UploadCloud size={18} /> {savingStatus === "submitted" ? "Submitting..." : "Submit for Review"}
        </button>
      </div>
    </form>
  );
}

function SubmissionPreview({ form, department }: { form: ReturnType<typeof formFromSubmission>; department: Department | null | undefined }) {
  const images = form.images.filter((image) => image.url);
  const bullets = form.bullets.split("\n").map((item) => item.trim()).filter(Boolean);
  const metrics = form.metrics.split("\n").map((item) => item.trim()).filter(Boolean).map(metricFromLine);

  return (
    <div className="mt-6 rounded-lg border border-orange-100 bg-[#fff8f1] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-mypal-orange">Submission Preview</p>
          <h3 className="mt-1 text-xl font-black text-[#2a211d]">{form.sectionTitle || department?.sectionTitle || "Team update"}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700">{images.length ? `${images.length} photo${images.length === 1 ? "" : "s"}` : "Text-only ready"}</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <p className="text-lg font-black text-[#2a211d]">{form.headline || "Headline preview"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{form.intro || "Your introduction will appear here."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {metrics.slice(0, 4).map((metric) => <span key={`${metric.label}-${metric.value}`} className="rounded bg-white px-3 py-2 text-xs font-black text-[#2a211d]">{metric.label}: {metric.value || "-"}</span>)}
          </div>
          <ul className="mt-3 grid gap-2">
            {bullets.slice(0, 3).map((bullet) => <li key={bullet} className="text-sm font-semibold text-slate-700">• {bullet}</li>)}
          </ul>
        </div>
        {images[0] ? <img src={images[0].url} alt={images[0].caption || "Preview photo"} className="h-40 w-full rounded object-cover" /> : <div className="grid h-40 place-items-center rounded border border-dashed border-orange-200 bg-white text-center text-sm font-bold text-orange-700">No photo selected. PDF will use a clean text layout.</div>}
      </div>
    </div>
  );
}

function ReviewBoard({
  issue,
  user,
  submissions,
  departments,
  onPatch,
  onCreated,
  generatedPdfs
}: {
  issue: NewsletterIssue;
  user: AppUser;
  submissions: Submission[];
  departments: Department[];
  onPatch: (id: string, patch: Partial<Submission>) => Promise<void>;
  onCreated: () => Promise<void>;
  generatedPdfs: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
}) {
  const buckets: SubmissionStatus[] = ["submitted", "approved", "rejected", "draft"];
  const readiness = getReadiness(issue, submissions, departments);
  const [busyAction, setBusyAction] = useState("");

  async function act(id: string, patch: Partial<Submission>, label: string) {
    setBusyAction(`${id}-${label}`);
    await onPatch(id, patch);
    setBusyAction("");
  }

  return (
    <div className="space-y-6">
      <ProductionReadiness readiness={readiness} issue={issue} />
      <div className="grid gap-4 md:grid-cols-4">
        {buckets.map((status) => (
          <div key={status} className="rounded-lg border border-orange-100 bg-white p-4 shadow-soft">
            <p className="text-sm font-bold capitalize text-orange-700">{status}</p>
            <p className="mt-2 text-3xl font-black text-[#2a211d]">{submissions.filter((item) => item.status === status).length}</p>
          </div>
        ))}
      </div>

      <CustomSectionCreator issue={issue} user={user} submissions={submissions} onCreated={onCreated} />

      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#2a211d]">Review Workflow</h2>
          <a href="/preview" target="_blank" className="flex items-center gap-2 rounded border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#2a211d]">
            <FileText size={16} /> Preview Newsletter
          </a>
        </div>
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded border border-orange-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={submission.status} />
                    <span className="rounded bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">{departmentName(departments, submission.departmentId)}</span>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <input type="checkbox" checked={submission.visible} onChange={(event) => onPatch(submission.id, { visible: event.target.checked })} />
                      Show in PDF
                    </label>
                  </div>
                  <input defaultValue={submission.sectionTitle} onBlur={(event) => onPatch(submission.id, { sectionTitle: event.target.value })} className="mt-3 w-full rounded border border-transparent px-0 text-xl font-black text-[#2a211d] outline-none focus:border-orange-200 focus:px-2" />
                  <input defaultValue={submission.headline} onBlur={(event) => onPatch(submission.id, { headline: event.target.value })} className="mt-1 w-full rounded border border-transparent px-0 font-semibold text-slate-700 outline-none focus:border-orange-200 focus:px-2" />
                  <textarea defaultValue={submission.intro} onBlur={(event) => onPatch(submission.id, { intro: event.target.value })} rows={2} className="mt-2 w-full rounded border border-orange-100 px-3 py-2 text-sm leading-6 text-slate-600 outline-mypal-orange" />
                  <input defaultValue={submission.reviewerNote ?? ""} onBlur={(event) => onPatch(submission.id, { reviewerNote: event.target.value })} className="mt-2 w-full rounded border border-orange-100 px-3 py-2 text-sm text-amber-800 outline-mypal-orange" placeholder="Reviewer note or rejection reason visible to contributor" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={Boolean(busyAction)} onClick={() => act(submission.id, { status: "approved" }, "approve")} className="flex items-center gap-2 rounded bg-emerald-600 px-3 py-2 text-sm font-black text-white disabled:opacity-60" aria-label="Approve">
                    <CheckCircle2 size={18} /> {busyAction === `${submission.id}-approve` ? "Approving..." : "Approve"}
                  </button>
                  <button disabled={Boolean(busyAction)} onClick={() => act(submission.id, { status: "rejected" }, "reject")} className="flex items-center gap-2 rounded bg-rose-600 px-3 py-2 text-sm font-black text-white disabled:opacity-60" aria-label="Reject">
                    <XCircle size={18} /> {busyAction === `${submission.id}-reject` ? "Rejecting..." : "Reject"}
                  </button>
                  <input type="number" defaultValue={submission.sortOrder} onBlur={(event) => onPatch(submission.id, { sortOrder: Number(event.target.value) })} className="w-16 rounded border border-orange-200 px-2 text-sm" aria-label="Sort order" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-[#2a211d]">Generated PDFs</h2>
        <div className="mt-3 space-y-2">
          {generatedPdfs.length ? generatedPdfs.map((pdf) => (
            <a key={pdf.id} href={pdf.fileUrl} target="_blank" className="flex items-center justify-between rounded border border-orange-100 px-4 py-3 text-sm font-bold text-[#2a211d]">
              {pdf.fileName}
              <Download size={16} />
            </a>
          )) : <p className="text-sm text-slate-500">No PDFs generated yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ProductionReadiness({ readiness, issue }: { readiness: ReturnType<typeof getReadiness>; issue: NewsletterIssue }) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-mypal-orange">
            <ClipboardList size={22} />
            <p className="text-sm font-black uppercase tracking-[0.16em]">Production command center</p>
          </div>
          <h2 className="mt-2 text-3xl font-black text-[#2a211d]">{issue.title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Deadline {issue.dueDate ? formatDate(issue.dueDate) : "not set"} • Publish date {formatDate(issue.date)}
          </p>
        </div>
        <div className="rounded bg-orange-50 px-5 py-4 text-center">
          <p className="text-4xl font-black text-mypal-orange">{readiness.score}%</p>
          <p className="text-xs font-black uppercase text-orange-700">Ready to publish</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <ReadinessTile label="Required teams" value={`${readiness.requiredSubmitted}/${readiness.requiredTotal}`} tone={readiness.requiredSubmitted === readiness.requiredTotal ? "good" : "warn"} />
        <ReadinessTile label="Approved sections" value={String(readiness.approved)} tone={readiness.approved >= readiness.requiredTotal ? "good" : "warn"} />
        <ReadinessTile label="Visible sections" value={String(readiness.visible)} tone={readiness.visible ? "good" : "warn"} />
        <ReadinessTile label="Image checks" value={`${readiness.imageReady}/${readiness.visible || 1}`} tone={readiness.imageReady === readiness.visible ? "good" : "warn"} />
      </div>
      {readiness.blockers.length ? (
        <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-black text-amber-900"><AlertCircle size={18} /> Blockers before export</div>
          <ul className="mt-2 grid gap-1 text-sm font-semibold text-amber-800">
            {readiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
          </ul>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-4 font-black text-emerald-800">
          <Sparkles size={18} /> This issue is ready for final preview and export.
        </div>
      )}
    </div>
  );
}

function ReadinessTile({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" }) {
  return (
    <div className={`rounded border p-4 ${tone === "good" ? "border-emerald-100 bg-emerald-50" : "border-orange-100 bg-orange-50"}`}>
      <p className={`text-2xl font-black ${tone === "good" ? "text-emerald-700" : "text-mypal-orange"}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-slate-600">{label}</p>
    </div>
  );
}

function CustomSectionCreator({ issue, user, submissions, onCreated }: { issue: NewsletterIssue; user: AppUser; submissions: Submission[]; onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sectionTitle: "",
    headline: "",
    intro: "",
    bullets: "Key update:\nOutcome:\nNext step:",
    metrics: "Highlights: 1",
    visible: true
  });
  const [message, setMessage] = useState("");

  async function createSection(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issueId: issue.id,
        userId: user.id,
        departmentId: `custom-${Date.now()}`,
        sectionTitle: form.sectionTitle,
        headline: form.headline,
        intro: form.intro,
        bullets: form.bullets.split("\n").map((item) => item.trim()).filter(Boolean),
        metrics: form.metrics.split("\n").map((item) => item.trim()).filter(Boolean).map(metricFromLine),
        images: emptyImages.map((image, index) => ({
          ...image,
          url: `https://dummyimage.com/900x520/f47b20/ffffff.png&text=Custom+${index + 1}`,
          caption: `Custom section image ${index + 1}`
        })),
        status: "approved",
        visible: form.visible,
        sortOrder: submissions.length + 1
      })
    });

    if (!response.ok) {
      setMessage("Add a title, headline, intro, and at least 3 bullet lines.");
      return;
    }

    setForm({ sectionTitle: "", headline: "", intro: "", bullets: "Key update:\nOutcome:\nNext step:", metrics: "Highlights: 1", visible: true });
    setOpen(false);
    await onCreated();
  }

  return (
    <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#2a211d]">Custom Sections</h2>
          <p className="mt-1 text-sm text-slate-600">Add awards, birthdays, partner announcements, events, or founder updates without waiting on a department.</p>
        </div>
        <button onClick={() => setOpen((current) => !current)} className="flex items-center gap-2 rounded bg-mypal-orange px-4 py-2 text-sm font-bold text-white">
          <Plus size={16} /> Add Section
        </button>
      </div>
      {open ? (
        <form onSubmit={createSection} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Section title" value={form.sectionTitle} onChange={(value) => setForm({ ...form, sectionTitle: value })} />
          <Field label="Headline" value={form.headline} onChange={(value) => setForm({ ...form, headline: value })} />
          <div className="md:col-span-2">
            <TextArea label="Intro" value={form.intro} onChange={(value) => setForm({ ...form, intro: value })} rows={3} />
            <TextArea label="Bullets" value={form.bullets} onChange={(value) => setForm({ ...form, bullets: value })} rows={4} />
            <button className="mt-4 rounded bg-mypal-orange px-5 py-3 font-bold text-white">Create approved section</button>
            {message ? <p className="mt-3 text-sm font-bold text-rose-700">{message}</p> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}

function IssuePlanner({
  issue,
  users,
  submissions,
  departments,
  emailOutbox,
  onReminded,
  onSaved
}: {
  issue: NewsletterIssue;
  users: AppUser[];
  submissions: Submission[];
  departments: Department[];
  emailOutbox: EmailOutboxItem[];
  onReminded: () => Promise<void>;
  onSaved: (patch: Partial<NewsletterIssue>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: issue.title,
    month: issue.month,
    year: String(issue.year),
    date: issue.date,
    dueDate: issue.dueDate ?? "",
    issueNumber: issue.issueNumber,
    status: issue.status,
    ownerId: issue.ownerId ?? "",
    notes: issue.notes ?? ""
  });
  const readiness = getReadiness(issue, submissions, departments);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderChannel, setReminderChannel] = useState("all");

  async function save(event: FormEvent) {
    event.preventDefault();
    await onSaved({
      ...form,
      year: Number(form.year),
      status: form.status as NewsletterIssue["status"]
    });
  }

  async function sendReminders() {
    setReminderMessage("Sending reminders...");
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: reminderChannel })
    });
    const data = await response.json();
    setReminderMessage(response.ok ? `Reminders queued for ${data.sent} contributor(s).` : "Could not send reminders.");
    await onReminded();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
      <form onSubmit={save} className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-mypal-orange" size={22} />
          <h2 className="text-2xl font-black text-[#2a211d]">Issue Planner</h2>
        </div>
        <Field label="Newsletter title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Month" value={form.month} onChange={(value) => setForm({ ...form, month: value })} />
          <Field label="Year" value={form.year} onChange={(value) => setForm({ ...form, year: value })} />
          <Field label="Publish date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} type="date" />
          <Field label="Submission due date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} type="date" />
          <Field label="Issue number" value={form.issueNumber} onChange={(value) => setForm({ ...form, issueNumber: value })} />
          <SelectField label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as NewsletterIssue["status"] })} options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }]} />
        </div>
        <SelectField label="Owner" value={form.ownerId} onChange={(value) => setForm({ ...form, ownerId: value })} options={[{ label: "Unassigned", value: "" }, ...users.filter((item) => item.role === "admin").map((item) => ({ label: item.name, value: item.id }))]} />
        <TextArea label="Internal production notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} rows={5} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white"><Save size={18} /> Save Issue Plan</button>
          <select value={reminderChannel} onChange={(event) => setReminderChannel(event.target.value)} className="rounded border border-orange-200 bg-white px-4 py-3 font-bold text-[#2a211d]">
            <option value="all">Email + WhatsApp</option>
            <option value="email">Email only</option>
            <option value="whatsapp">WhatsApp only</option>
          </select>
          <button type="button" onClick={sendReminders} className="flex items-center gap-2 rounded border border-orange-200 bg-white px-5 py-3 font-bold text-[#2a211d]"><Send size={18} /> Send Reminders</button>
        </div>
        {reminderMessage ? <p className="mt-4 rounded bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800">{reminderMessage}</p> : null}
      </form>

      <div className="space-y-6">
        <ProductionReadiness readiness={readiness} issue={{ ...issue, ...form, year: Number(form.year), status: form.status as NewsletterIssue["status"] }} />
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-[#2a211d]">Team Collection Board</h2>
          <div className="mt-4 grid gap-3">
            {teamDepartments(departments).map((department) => {
              const submission = submissions.find((item) => item.departmentId === department.id);
              return (
                <div key={department.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-orange-100 px-4 py-3">
                  <div>
                    <p className="font-black text-[#2a211d]">{department.name}</p>
                    <p className="text-sm text-slate-600">{submission?.headline ?? "No update submitted yet"}</p>
                  </div>
                  <StatusBadge status={submission?.status ?? "draft"} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-[#2a211d]">Email Delivery Log</h2>
          <div className="mt-4 grid gap-2">
            {emailOutbox.length ? emailOutbox.slice(0, 6).map((email) => (
              <div key={email.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-orange-100 px-4 py-3 text-sm">
                <div>
                  <p className="font-black text-[#2a211d]">{email.subject}</p>
                  <p className="text-slate-600">{email.to}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${email.status === "sent" ? "bg-emerald-50 text-emerald-700" : email.status === "failed" ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>{email.status}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No emails queued yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesignStudio({
  issue,
  settings,
  submissions,
  onPatch,
  onSettingsSaved
}: {
  issue: NewsletterIssue;
  settings: AdminSettings;
  submissions: Submission[];
  onPatch: (id: string, patch: Partial<Submission>) => Promise<void>;
  onSettingsSaved: () => Promise<void>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
          <h2 className="text-2xl font-black text-[#2a211d]">Design Studio</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use this like a lightweight Canva panel: change brand fields, edit copy, reorder sections, hide blocks, then export the PDF.</p>
        </div>
        <SettingsForm settings={settings} compact onSaved={onSettingsSaved} />
        <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
          <h3 className="font-black text-[#2a211d]">Section Layout</h3>
          <div className="mt-3 space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded border border-orange-100 p-3">
                <label className="flex items-center justify-between gap-3 text-sm font-bold text-[#2a211d]">
                  <span>{submission.sectionTitle}</span>
                  <input type="checkbox" checked={submission.visible} onChange={(event) => onPatch(submission.id, { visible: event.target.checked })} />
                </label>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-700">Order</span>
                  <input type="number" defaultValue={submission.sortOrder} onBlur={(event) => onPatch(submission.id, { sortOrder: Number(event.target.value) })} className="w-20 rounded border border-orange-200 px-2 py-1 text-sm" />
                </div>
                <input defaultValue={submission.headline} onBlur={(event) => onPatch(submission.id, { headline: event.target.value })} className="mt-3 w-full rounded border border-orange-100 px-3 py-2 text-sm font-bold outline-mypal-orange" />
                <textarea defaultValue={submission.intro} onBlur={(event) => onPatch(submission.id, { intro: event.target.value })} rows={4} className="mt-2 w-full rounded border border-orange-100 px-3 py-2 text-sm leading-6 outline-mypal-orange" />
                <textarea defaultValue={submission.bullets.join("\n")} onBlur={(event) => onPatch(submission.id, { bullets: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} rows={4} className="mt-2 w-full rounded border border-orange-100 px-3 py-2 text-sm leading-6 outline-mypal-orange" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black text-[#2a211d]">Live PDF Preview</h3>
          <a href="/preview" target="_blank" className="rounded bg-mypal-orange px-3 py-2 text-sm font-bold text-white">Open full preview</a>
        </div>
        <div className="h-[820px] overflow-auto rounded border border-orange-100 bg-[#fff7f0] p-4">
          <div className="origin-top scale-[0.78]">
            <NewsletterPreview settings={settings} issue={issue} submissions={submissions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountsPanel({ users, departments, onCreated }: { users: AppUser[]; departments: Department[]; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "contributor", departmentId: "academic", whatsappSubscriberId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "contributor", departmentId: "academic", whatsappSubscriberId: "", active: true });
  const [departmentForm, setDepartmentForm] = useState({ name: "", ownerTitle: "" });
  const [message, setMessage] = useState("");

  async function createAccount(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message ?? "Could not create account.");
      return;
    }
    setForm({ name: "", email: "", password: "", role: "contributor", departmentId: "academic", whatsappSubscriberId: "" });
    setMessage("Account created.");
    await onCreated();
  }

  function startEdit(user: AppUser) {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      departmentId: user.departmentId ?? "academic",
      whatsappSubscriberId: user.whatsappSubscriberId ?? "",
      active: user.active !== false
    });
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setMessage("");
    const response = await fetch(`/api/users/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        password: editForm.password || undefined,
        departmentId: editForm.role === "admin" ? undefined : editForm.departmentId,
        whatsappSubscriberId: editForm.whatsappSubscriberId || undefined
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message ?? "Could not update account.");
      return;
    }
    setEditingId(null);
    setMessage("Account updated.");
    await onCreated();
  }

  async function createDepartment() {
    setMessage("");
    const response = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: departmentForm.name,
        sectionTitle: departmentForm.name,
        ownerTitle: departmentForm.ownerTitle || "Team Owner"
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message ?? "Could not add department.");
      return;
    }
    setDepartmentForm({ name: "", ownerTitle: "" });
    setMessage("Department added.");
    await onCreated();
  }

  async function deleteAccount(id: string) {
    setMessage("");
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.message ?? "Could not delete account.");
      return;
    }
    setMessage("Account deleted.");
    await onCreated();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={createAccount} className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_24px_70px_rgba(97,48,17,0.09)]">
        <div className="flex items-center gap-2">
          <UserPlus className="text-mypal-orange" size={22} />
          <h2 className="text-2xl font-black text-[#2a211d]">Create Team Account</h2>
        </div>
        <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} type="password" />
        <SelectField label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={[{ label: "Contributor", value: "contributor" }, { label: "Admin", value: "admin" }]} />
        {form.role === "contributor" ? <SelectField label="Department" value={form.departmentId} onChange={(value) => setForm({ ...form, departmentId: value })} options={teamDepartments(departments).map((item) => ({ label: item.name, value: item.id }))} /> : null}
        <Field label="WhatsApp subscriber ID" value={form.whatsappSubscriberId} onChange={(value) => setForm({ ...form, whatsappSubscriberId: value })} />
        {message ? <p className="mt-4 rounded bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800">{message}</p> : null}
        <button className="mt-6 flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white"><UserPlus size={18} /> Create Account</button>
        <div className="mt-8 border-t border-orange-100 pt-6">
          <h3 className="font-black text-[#2a211d]">Add Department</h3>
          <Field label="Department name" value={departmentForm.name} onChange={(value) => setDepartmentForm({ ...departmentForm, name: value })} />
          <Field label="Owner title" value={departmentForm.ownerTitle} onChange={(value) => setDepartmentForm({ ...departmentForm, ownerTitle: value })} />
          <button type="button" onClick={createDepartment} className="mt-4 rounded border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#2a211d]">Add Department</button>
        </div>
      </form>

      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_24px_70px_rgba(97,48,17,0.09)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-mypal-orange" size={22} />
          <h2 className="text-2xl font-black text-[#2a211d]">Team Access Console</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {users.map((item) => (
            <div key={item.id} className="rounded border border-orange-100 px-4 py-3">
              {editingId === item.id ? (
                <form onSubmit={saveEdit} className="grid gap-3 md:grid-cols-2">
                  <Field label="Name" value={editForm.name} onChange={(value) => setEditForm({ ...editForm, name: value })} />
                  <Field label="Email" value={editForm.email} onChange={(value) => setEditForm({ ...editForm, email: value })} />
                  <Field label="New password" value={editForm.password} onChange={(value) => setEditForm({ ...editForm, password: value })} type="password" />
                  <SelectField label="Role" value={editForm.role} onChange={(value) => setEditForm({ ...editForm, role: value })} options={[{ label: "Contributor", value: "contributor" }, { label: "Admin", value: "admin" }]} />
                  {editForm.role === "contributor" ? <SelectField label="Department" value={editForm.departmentId} onChange={(value) => setEditForm({ ...editForm, departmentId: value })} options={teamDepartments(departments).map((department) => ({ label: department.name, value: department.id }))} /> : null}
                  <Field label="WhatsApp subscriber ID" value={editForm.whatsappSubscriberId} onChange={(value) => setEditForm({ ...editForm, whatsappSubscriberId: value })} />
                  <label className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={editForm.active} onChange={(event) => setEditForm({ ...editForm, active: event.target.checked })} />
                    Active login
                  </label>
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <button className="rounded bg-mypal-orange px-4 py-2 text-sm font-bold text-white">Save changes</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded border border-orange-200 px-4 py-2 text-sm font-bold text-[#2a211d]">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[#2a211d]">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right text-sm">
                    <div>
                      <p className="font-bold capitalize text-orange-700">{item.role}{item.active === false ? " · inactive" : ""}</p>
                      <p className="text-slate-500">{item.role === "admin" ? "All admin tools" : departmentName(departments, item.departmentId ?? "")}</p>
                    </div>
                    <button onClick={() => startEdit(item)} className="rounded border border-orange-200 p-2 text-orange-700" aria-label="Edit user"><Pencil size={16} /></button>
                    <button onClick={() => deleteAccount(item.id)} className="rounded border border-rose-200 p-2 text-rose-700" aria-label="Delete user"><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StakeholderPanel({ settings, onSaved }: { settings: AdminSettings; onSaved: () => Promise<void> }) {
  const [lines, setLines] = useState((settings.stakeholders ?? []).map((item) => `${item.name}, ${item.email}, ${item.group}, ${item.whatsappSubscriberId ?? ""}`).join("\n"));
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    const stakeholders = lines.split("\n").map((line, index) => {
      const [name, email, group, whatsappSubscriberId] = line.split(",").map((item) => item.trim());
      return { id: `stakeholder-${index}`, name, email, group: group || "Stakeholder", whatsappSubscriberId };
    }).filter((item) => item.name && item.email);

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, stakeholders })
    });

    if (!response.ok) {
      setMessage("Could not save stakeholders. Check email format.");
      return;
    }
    setMessage(`Saved ${stakeholders.length} stakeholder(s).`);
    await onSaved();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
      <form onSubmit={save} className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Send className="text-mypal-orange" size={22} />
          <h2 className="text-2xl font-black text-[#2a211d]">Stakeholder Database</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Admins can maintain the publishing audience here. Publish sends the latest generated PDF to this list.</p>
        <TextArea label="Stakeholders" hint="One per line: Name, email, group, whatsappSubscriberId" value={lines} onChange={setLines} rows={12} />
        <button className="mt-5 rounded bg-mypal-orange px-5 py-3 font-bold text-white">Save Stakeholders</button>
        {message ? <p className="mt-4 rounded bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800">{message}</p> : null}
      </form>
      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-[#2a211d]">Current List</h2>
        <div className="mt-4 grid gap-3">
          {(settings.stakeholders ?? []).length ? settings.stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="rounded border border-orange-100 px-4 py-3">
              <p className="font-black text-[#2a211d]">{stakeholder.name}</p>
              <p className="text-sm font-semibold text-slate-600">{stakeholder.email}</p>
              <p className="mt-1 text-xs font-black uppercase text-orange-700">{stakeholder.group}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No stakeholders added yet.</p>}
        </div>
      </div>
    </div>
  );
}

function SettingsForm({ settings, onSaved, compact = false }: { settings: AdminSettings; onSaved: () => Promise<void>; compact?: boolean }) {
  const [form, setForm] = useState(settings);
  const [noteRole, setNoteRole] = useState(noteRoles.includes(settings.leadership.designation) ? settings.leadership.designation : "Other");
  const [socialLines, setSocialLines] = useState((settings.socialLinks ?? []).map((item) => `${item.label}: ${item.url}`).join("\n"));
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    const nextForm = {
      ...form,
      socialLinks: socialLines.split("\n").map((line, index) => {
        const [label, ...url] = line.split(":");
        return { id: `social-${index}`, label: label.trim(), url: url.join(":").trim() };
      }).filter((item) => item.label && item.url),
      stakeholders: form.stakeholders ?? []
    };
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextForm)
    });
    setForm(nextForm);
    setSaved(true);
    await onSaved();
  }

  return (
    <form onSubmit={save} className="rounded-lg border border-orange-100 bg-white p-6 shadow-soft">
      <h2 className={`${compact ? "text-xl" : "text-3xl"} font-black text-[#2a211d]`}>Brand Settings</h2>
      <div className={compact ? "grid gap-3" : "grid gap-5 md:grid-cols-2"}>
        <Field label="Company logo URL" value={form.companyLogoUrl} onChange={(value) => setForm({ ...form, companyLogoUrl: value })} />
        <Field label="Newsletter title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <Field label="Footer text" value={form.footerText} onChange={(value) => setForm({ ...form, footerText: value })} />
        <Field label="Website link" value={form.websiteUrl} onChange={(value) => setForm({ ...form, websiteUrl: value })} />
        <Field label="Social media handle" value={form.socialHandle} onChange={(value) => setForm({ ...form, socialHandle: value })} />
        <Field label="QR code image URL" value={form.qrCodeUrl} onChange={(value) => setForm({ ...form, qrCodeUrl: value })} />
      </div>
      <TextArea label="Clickable social links" hint="One per line. Format: Instagram: https://..." value={socialLines} onChange={setSocialLines} rows={compact ? 4 : 5} />

      <h3 className="mt-8 text-xl font-black text-[#2a211d]">Main Note Author</h3>
      <div className={compact ? "grid gap-3" : "grid gap-5 md:grid-cols-2"}>
        <Field label="Author name" value={form.leadership.name} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, name: value } })} />
        <SelectField label="From" value={noteRole} onChange={(value) => {
          setNoteRole(value);
          if (value !== "Other") setForm({ ...form, leadership: { ...form.leadership, designation: value } });
        }} options={noteRoles.map((role) => ({ label: role, value: role }))} />
        {noteRole === "Other" ? <Field label="Other designation" value={form.leadership.designation} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, designation: value } })} /> : null}
        <Field label="Qualification" value={form.leadership.qualification} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, qualification: value } })} />
      </div>
      <SingleImageUpload label="Author photo" value={form.leadership.photoUrl} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, photoUrl: value } })} />
      <TextArea label="Monthly message" value={form.leadership.message} onChange={(value) => setForm({ ...form, leadership: { ...form.leadership, message: value } })} rows={compact ? 4 : 5} />

      {saved ? <p className="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Settings saved.</p> : null}
      <button className="mt-6 flex items-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white"><Save size={18} /> Save Settings</button>
    </form>
  );
}

function ImageDropCard({ image, index, onChange }: { image: SubmissionImage; index: number; onChange: (patch: Partial<SubmissionImage>) => void }) {
  return (
    <div className="rounded border border-orange-100 bg-orange-50/40 p-4">
      <DropZone label={`Photo ${index + 1}`} value={image.url} onChange={(url) => onChange({ url })} />
      <input value={image.url.startsWith("data:") ? "Uploaded photo" : image.url} onChange={(event) => onChange({ url: event.target.value })} className="mt-3 w-full rounded border border-orange-100 bg-white px-3 py-2 text-sm" placeholder="Image URL or dropped photo" />
      <input value={image.caption} onChange={(event) => onChange({ caption: event.target.value })} className="mt-2 w-full rounded border border-orange-100 bg-white px-3 py-2 text-sm" placeholder="Caption" />
    </div>
  );
}

function SingleImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mt-5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <DropZone label="Drop author photo" value={value} onChange={onChange} />
      <input value={value.startsWith("data:") ? "Uploaded photo" : value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-orange-100 bg-white px-3 py-3 outline-mypal-orange" />
    </div>
  );
}

function DropZone({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl, folder: "newsletter-images" })
    });
    const payload = await response.json();
    onChange(payload.url ?? dataUrl);
  }

  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void handleFiles(event.dataTransfer.files);
      }}
      className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded border-2 border-dashed border-orange-200 bg-white p-4 text-center transition hover:border-mypal-orange"
    >
      {value ? <img src={value} alt={label} className="mb-3 h-28 w-full rounded object-cover" /> : <UploadCloud className="mb-2 text-mypal-orange" size={28} />}
      <span className="text-sm font-black text-[#2a211d]">{label}</span>
      <span className="mt-1 text-xs text-orange-700">Drag and drop, or click to upload</span>
      <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleFiles(event.target.files)} />
    </label>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-orange-100 bg-white px-3 py-3 outline-mypal-orange" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-orange-100 bg-white px-3 py-3 outline-mypal-orange">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, hint, value, onChange, rows }: { label: string; hint?: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {hint ? <span className="ml-2 text-xs text-orange-700">{hint}</span> : null}
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-orange-100 bg-white px-3 py-3 outline-mypal-orange" />
    </label>
  );
}

function formFromSubmission(submission: Submission | undefined, department: Department | null | undefined) {
  return {
    id: submission?.id,
    sectionTitle: submission?.sectionTitle ?? department?.sectionTitle ?? "",
    headline: submission?.headline ?? "",
    intro: submission?.intro ?? "",
    bullets: submission?.bullets?.join("\n") ?? "",
    metrics: submission?.metrics?.map((metric) => `${metric.label}: ${metric.value}`).join("\n") ?? "Students reached: \nLeads generated: \nAdmissions: ",
    images: submission?.images?.length ? submission.images : emptyImages,
    status: submission?.status ?? "draft",
    reviewerNote: submission?.reviewerNote ?? ""
  };
}

function formatSubmissionError(data: unknown) {
  if (!data || typeof data !== "object" || !("errors" in data)) return "";
  const errors = (data as { errors?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }).errors;
  const fieldErrors = errors?.fieldErrors ?? {};
  return Object.entries(fieldErrors)
    .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
    .concat(errors?.formErrors ?? [])
    .join(" ");
}

function metricFromLine(item: string) {
  const [label, ...value] = item.split(":");
  return { label: label.trim(), value: value.join(":").trim() || "0" };
}

function departmentName(departments: Department[], id: string) {
  return departments.find((item) => item.id === id)?.name ?? id;
}

function teamDepartments(departments: Department[]) {
  return departments.filter((department) => department.id !== "leadership");
}

function getReadiness(issue: NewsletterIssue, submissions: Submission[], departments: Department[]) {
  const requiredDepartments = teamDepartments(departments);
  const visibleSubmissions = submissions.filter((submission) => submission.visible);
  const approvedVisible = visibleSubmissions.filter((submission) => ["approved", "published"].includes(submission.status));
  const requiredSubmitted = requiredDepartments.filter((department) =>
    submissions.some((submission) => submission.departmentId === department.id && submission.status !== "draft")
  ).length;
  const imageReady = visibleSubmissions.filter((submission) => submission.images.every((image) => image.url && image.caption)).length;
  const blockers: string[] = [];

  requiredDepartments.forEach((department) => {
    const submission = submissions.find((item) => item.departmentId === department.id);
    if (!submission || submission.status === "draft") blockers.push(`${department.name} has not submitted a final update.`);
    if (submission && !["approved", "published"].includes(submission.status)) blockers.push(`${department.name} is not approved yet.`);
  });

  visibleSubmissions.forEach((submission) => {
    if (submission.bullets.length < 3) blockers.push(`${submission.sectionTitle} needs at least 3 bullet updates.`);
  });

  if (!issue.dueDate) blockers.push("Submission due date is not set.");
  if (!visibleSubmissions.length) blockers.push("No visible sections are selected for the PDF.");

  const checks = [
    requiredSubmitted === requiredDepartments.length,
    approvedVisible.length >= requiredDepartments.length,
    imageReady === visibleSubmissions.length && visibleSubmissions.length > 0,
    Boolean(issue.date && issue.issueNumber && issue.dueDate),
    blockers.length === 0
  ];

  return {
    score: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    requiredSubmitted,
    requiredTotal: requiredDepartments.length,
    approved: approvedVisible.length,
    visible: visibleSubmissions.length,
    imageReady,
    blockers: [...new Set(blockers)].slice(0, 8)
  };
}

function formatDate(value: string) {
  if (!value) return "not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
