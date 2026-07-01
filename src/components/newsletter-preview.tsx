import type { AdminSettings, NewsletterIssue, Submission } from "@/lib/types";

export function NewsletterPreview({
  settings,
  issue,
  submissions
}: {
  settings: AdminSettings;
  issue: NewsletterIssue;
  submissions: Submission[];
}) {
  const approved = submissions
    .filter((item) => item.visible && ["approved", "published"].includes(item.status))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <article className="mx-auto max-w-[900px] bg-white text-mypal-ink shadow-soft print:max-w-none print:shadow-none">
      <section className="relative overflow-hidden bg-mypal-deep px-10 py-10 text-white print:break-after-page">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-full bg-mypal-orange" />
        <div className="relative z-10 flex items-start justify-between gap-8">
          <div>
            <img src={settings.companyLogoUrl} alt="myPAL logo" className="mb-12 h-16 max-w-56 rounded bg-white object-contain p-2" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-100">
              {issue.month} {issue.year} • Issue {issue.issueNumber}
            </p>
            <h1 className="mt-4 max-w-2xl text-6xl font-black leading-[0.95]">
              {settings.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-100">
              A monthly snapshot of progress across learning, growth, product, and brand teams.
            </p>
          </div>
          <div className="min-w-36 rounded bg-white/10 p-4 text-right">
            <p className="text-xs uppercase text-orange-100">Published</p>
            <p className="mt-2 text-xl font-bold">{new Date(issue.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="px-10 py-10 print:break-after-page">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div>
            <img src={settings.leadership.photoUrl} alt={settings.leadership.name} className="aspect-square w-full rounded-lg object-cover" />
            <h2 className="mt-4 text-2xl font-extrabold">{settings.leadership.name}</h2>
            <p className="font-semibold text-mypal-orange">{settings.leadership.designation}</p>
            <p className="text-sm text-slate-500">{settings.leadership.qualification}</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mypal-orange">Leadership Note</p>
            <h3 className="mt-3 text-4xl font-black text-mypal-deep">From the leadership desk</h3>
            <p className="mt-5 text-xl leading-9 text-slate-700">{settings.leadership.message}</p>
          </div>
        </div>
      </section>

      {approved.map((submission) => (
        <section key={submission.id} className="px-10 py-10 print:break-after-page">
          <div className="mb-6 flex items-end justify-between gap-6 border-b-4 border-mypal-orange pb-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-mypal-orange">{submission.departmentId}</p>
              <h2 className="text-4xl font-black text-mypal-deep">{submission.sectionTitle}</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {submission.metrics.slice(0, 3).map((metric) => (
                <div key={metric.label} className="min-w-24 rounded bg-mypal-cloud p-3 text-center">
                  <p className="text-xl font-black text-mypal-orange">{metric.value}</p>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="max-w-3xl text-2xl font-extrabold leading-tight">{submission.headline}</h3>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{submission.intro}</p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {submission.images.slice(0, 4).map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-lg bg-mypal-cloud">
                <img src={image.url} alt={image.caption} className="h-48 w-full object-cover" />
                <figcaption className="px-4 py-3 text-sm font-semibold text-slate-700">{image.caption}</figcaption>
              </figure>
            ))}
          </div>

          <ul className="mt-7 grid gap-3">
            {submission.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 rounded border border-slate-200 p-4 text-base leading-7">
                <span className="mt-2 h-2 w-2 flex-none rounded-full bg-mypal-orange" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="bg-mypal-deep px-10 py-8 text-white">
        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-2xl font-black">{settings.footerText}</p>
            <p className="mt-3 text-sm text-slate-200">{settings.websiteUrl} • {settings.socialHandle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[...settings.partnerLogos, ...settings.recognitionBadges].map((logo) => (
                <img key={logo.id} src={logo.imageUrl} alt={logo.name} className="h-12 rounded bg-white object-contain p-2" />
              ))}
            </div>
          </div>
          <img src={settings.qrCodeUrl} alt="QR code" className="h-28 w-28 rounded bg-white object-contain p-2" />
        </div>
      </footer>
    </article>
  );
}
