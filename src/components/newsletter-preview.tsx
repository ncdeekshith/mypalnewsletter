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
  const topMetrics = approved.flatMap((item) => item.metrics.slice(0, 2)).slice(0, 6);

  return (
    <article className="newsletter-doc mx-auto">
      <Page className="cover-page bg-mypal-orange text-white">
        <div className="absolute right-[-70px] top-[-70px] h-72 w-72 rounded-full bg-white/20" />
        <div className="absolute bottom-[-90px] left-[-80px] h-80 w-80 rounded-full border-[42px] border-white/15" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-8">
            <img src={settings.companyLogoUrl} alt="myPAL logo" className="h-16 max-w-56 rounded bg-white object-contain p-2 shadow-xl" />
            <div className="rounded bg-white px-5 py-4 text-right text-mypal-orange shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.14em]">Issue {issue.issueNumber}</p>
              <p className="mt-1 text-2xl font-black">{issue.month} {issue.year}</p>
            </div>
          </div>

          <div className="max-w-[660px]">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-white/85">Monthly internal newsletter</p>
            <h1 className="mt-5 text-[68px] font-black leading-[0.92] tracking-normal">{settings.title}</h1>
            <p className="mt-7 max-w-xl text-xl font-semibold leading-8 text-white/90">
              Progress, people, wins, and priorities from across myPAL.
            </p>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] gap-8">
            <div className="rounded bg-white/14 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Brand line</p>
              <p className="mt-2 text-2xl font-black">{settings.footerText}</p>
            </div>
            <div className="rounded bg-[#2a211d] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Published</p>
              <p className="mt-2 text-2xl font-black">{formatIssueDate(issue.date)}</p>
              <p className="mt-3 text-sm font-semibold text-white/75">{settings.websiteUrl}</p>
            </div>
          </div>
        </div>
      </Page>

      <Page>
        <PageHeader settings={settings} issue={issue} label="Leadership + Contents" />
        <div className="grid grid-cols-[220px_1fr] gap-8">
          <div>
            <img src={settings.leadership.photoUrl} alt={settings.leadership.name} className="aspect-square w-full rounded-lg object-cover shadow-soft" />
            <div className="mt-4 border-l-4 border-mypal-orange pl-4">
              <h2 className="text-2xl font-black text-[#2a211d]">{settings.leadership.name}</h2>
              <p className="font-black text-mypal-orange">{settings.leadership.designation}</p>
              <p className="text-sm font-semibold text-slate-500">{settings.leadership.qualification}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-mypal-orange">Main Note</p>
            <h2 className="mt-2 text-4xl font-black leading-tight text-[#2a211d]">From the leadership desk</h2>
            <p className="mt-5 text-[19px] leading-8 text-slate-700">{settings.leadership.message}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_260px] gap-8">
          <div>
            <h3 className="text-2xl font-black text-[#2a211d]">Inside this issue</h3>
            <div className="mt-4 grid gap-3">
              {approved.map((submission, index) => (
                <div key={submission.id} className="flex items-center gap-4 rounded border border-orange-100 bg-[#fff8f1] p-4">
                  <span className="grid h-9 w-9 place-items-center rounded bg-mypal-orange text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <p className="font-black text-[#2a211d]">{submission.sectionTitle}</p>
                    <p className="line-clamp-1 text-sm font-semibold text-slate-600">{submission.headline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2a211d]">Snapshot</h3>
            <div className="mt-4 grid gap-3">
              {topMetrics.map((metric) => (
                <div key={`${metric.label}-${metric.value}`} className="rounded bg-[#2a211d] p-4 text-white">
                  <p className="text-2xl font-black text-mypal-orange">{metric.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/70">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <PageFooter settings={settings} page="02" />
      </Page>

      {approved.map((submission, index) => (
        <SectionPage key={submission.id} settings={settings} issue={issue} submission={submission} pageNumber={String(index + 3).padStart(2, "0")} />
      ))}

      <Page className="dark-page text-white">
        <div className="flex h-full flex-col justify-between">
          <div>
            <img src={settings.companyLogoUrl} alt="myPAL logo" className="h-14 max-w-52 rounded bg-white object-contain p-2" />
            <h2 className="mt-16 max-w-2xl text-6xl font-black leading-tight">{settings.footerText}</h2>
            <p className="mt-8 max-w-xl text-xl leading-8 text-white/75">
              Thank you to every team for contributing the work, stories, and proof points that make this issue possible.
            </p>
          </div>
          <div className="grid grid-cols-[1fr_130px] gap-8 border-t border-white/15 pt-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-mypal-orange">Connect</p>
              <p className="mt-2 text-xl font-black">{settings.websiteUrl}</p>
              <p className="mt-1 text-lg font-semibold text-white/75">{settings.socialHandle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[...settings.partnerLogos, ...settings.recognitionBadges].map((logo) => (
                  <img key={logo.id} src={logo.imageUrl} alt={logo.name} className="h-12 rounded bg-white object-contain p-2" />
                ))}
              </div>
            </div>
            <img src={settings.qrCodeUrl} alt="QR code" className="h-32 w-32 rounded bg-white object-contain p-2" />
          </div>
        </div>
      </Page>
    </article>
  );
}

function SectionPage({
  settings,
  issue,
  submission,
  pageNumber
}: {
  settings: AdminSettings;
  issue: NewsletterIssue;
  submission: Submission;
  pageNumber: string;
}) {
  const hero = submission.images[0];
  const gallery = submission.images.slice(1, 4);

  return (
    <Page>
      <PageHeader settings={settings} issue={issue} label={submission.sectionTitle} />
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-7">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-mypal-orange">{submission.departmentId.replace("custom-", "custom")}</p>
          <h2 className="mt-2 text-4xl font-black leading-tight text-[#2a211d]">{submission.sectionTitle}</h2>
          <h3 className="mt-5 text-2xl font-black leading-snug text-[#2a211d]">{submission.headline}</h3>
          <p className="mt-4 text-base leading-7 text-slate-700">{submission.intro}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {submission.metrics.slice(0, 3).map((metric) => (
              <div key={metric.label} className="rounded bg-[#fff4eb] p-3 text-center">
                <p className="text-2xl font-black text-mypal-orange">{metric.value}</p>
                <p className="mt-1 text-[10px] font-black uppercase leading-tight text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
        {hero ? (
          <figure className="overflow-hidden rounded-lg bg-[#fff8f1] shadow-soft">
            <img src={hero.url} alt={hero.caption} className="h-[300px] w-full object-cover" />
            <figcaption className="px-4 py-3 text-sm font-black text-[#2a211d]">{hero.caption}</figcaption>
          </figure>
        ) : null}
      </div>

      <div className="mt-7 grid grid-cols-[1fr_1fr] gap-7">
        <div>
          <h4 className="mb-3 text-lg font-black text-[#2a211d]">Key updates</h4>
          <ul className="grid gap-3">
            {submission.bullets.slice(0, 5).map((bullet) => (
              <li key={bullet} className="flex gap-3 rounded border border-orange-100 bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 flex-none rounded-full bg-mypal-orange" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3">
          {gallery.map((image) => (
            <figure key={image.id} className="grid grid-cols-[120px_1fr] overflow-hidden rounded bg-[#fff8f1]">
              <img src={image.url} alt={image.caption} className="h-24 w-full object-cover" />
              <figcaption className="flex items-center px-4 text-sm font-black leading-5 text-[#2a211d]">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <PageFooter settings={settings} page={pageNumber} />
    </Page>
  );
}

function Page({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`newsletter-page relative overflow-hidden ${className}`}>{children}</section>;
}

function PageHeader({ settings, issue, label }: { settings: AdminSettings; issue: NewsletterIssue; label: string }) {
  return (
    <header className="mb-8 flex items-center justify-between border-b-2 border-orange-100 pb-4">
      <div className="flex items-center gap-3">
        <img src={settings.companyLogoUrl} alt="myPAL logo" className="h-9 max-w-32 rounded bg-mypal-orange object-contain p-1" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-mypal-orange">{label}</p>
          <p className="text-xs font-bold text-slate-500">{issue.month} {issue.year} • Issue {issue.issueNumber}</p>
        </div>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Internal Newsletter</p>
    </header>
  );
}

function PageFooter({ settings, page }: { settings: AdminSettings; page: string }) {
  return (
    <footer className="absolute bottom-8 left-10 right-10 flex items-center justify-between border-t border-orange-100 pt-4 text-xs font-bold text-slate-500">
      <span>{settings.socialHandle} • {settings.websiteUrl}</span>
      <span>{page}</span>
    </footer>
  );
}

function formatIssueDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
