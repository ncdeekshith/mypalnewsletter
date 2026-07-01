import type { AdminSettings, NewsletterIssue, Submission, SubmissionImage, SubmissionMetric } from "@/lib/types";

type SectionChunk = {
  intro: string;
  bullets: string[];
  metrics: SubmissionMetric[];
  images: SubmissionImage[];
};

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
    .filter((item) => item.visible && !["draft", "rejected"].includes(item.status))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const snapshotMetrics = approved.flatMap((item) =>
    item.metrics.map((metric) => ({ ...metric, section: item.sectionTitle }))
  );
  const snapshot = snapshotMetrics.length ? snapshotMetrics : approved.map((item) => ({
    label: item.sectionTitle,
    value: String(item.bullets.length),
    section: "Updates"
  }));
  let sectionPageNumber = 3;

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
              <p className="text-2xl font-black">{settings.footerText}</p>
              <SocialLinks settings={settings} theme="light" />
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
              {approved.length ? approved.map((submission, index) => (
                <div key={submission.id} className="flex items-center gap-4 rounded border border-orange-100 bg-[#fff8f1] p-4">
                  <span className="grid h-9 w-9 place-items-center rounded bg-mypal-orange text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <p className="font-black text-[#2a211d]">{submission.sectionTitle}</p>
                    <p className="line-clamp-1 text-sm font-semibold text-slate-600">{submission.headline}</p>
                  </div>
                </div>
              )) : (
                <div className="rounded border border-orange-100 bg-[#fff8f1] p-5">
                  <p className="font-black text-[#2a211d]">Content collection in progress</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Team sections will appear here as soon as contributors submit their monthly updates.</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2a211d]">Snapshot</h3>
            <div className="mt-4 grid max-h-[520px] gap-3 overflow-hidden">
              {snapshot.length ? snapshot.slice(0, 4).map((metric) => (
                <div key={`${metric.section}-${metric.label}-${metric.value}`} className="rounded bg-[#2a211d] p-4 text-white">
                  <p className="text-2xl font-black text-mypal-orange">{metric.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/70">{metric.label}</p>
                  <p className="mt-1 text-[10px] font-bold text-white/45">{metric.section}</p>
                </div>
              )) : (
                <div className="rounded bg-[#2a211d] p-5 text-white">
                  <p className="text-2xl font-black text-mypal-orange">--</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-white/70">Metrics will appear after teams submit updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <PageFooter settings={settings} page="02" />
      </Page>

      {approved.flatMap((submission) => {
        const chunks = buildSectionChunks(submission);
        const startPage = sectionPageNumber;
        sectionPageNumber += chunks.length;
        return chunks.map((chunk, index) => (
          <SectionPage
            key={`${submission.id}-${index}`}
            settings={settings}
            issue={issue}
            submission={submission}
            chunk={chunk}
            continuation={index > 0}
            pageNumber={String(startPage + index).padStart(2, "0")}
          />
        ));
      })}

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
              <a href={settings.websiteUrl} className="mt-2 block text-xl font-black text-white">{settings.websiteUrl}</a>
              <SocialLinks settings={settings} theme="dark" />
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
  chunk,
  continuation,
  pageNumber
}: {
  settings: AdminSettings;
  issue: NewsletterIssue;
  submission: Submission;
  chunk: SectionChunk;
  continuation: boolean;
  pageNumber: string;
}) {
  const hero = chunk.images[0];

  return (
    <Page>
      <PageHeader settings={settings} issue={issue} label={submission.sectionTitle} />
      <div className="newsletter-content">
        <div className={hero && !continuation ? "grid grid-cols-[1fr_260px] gap-7" : "grid gap-5"}>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-mypal-orange">{submission.departmentId.replace("custom-", "custom")}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-[#2a211d]">{submission.sectionTitle}{continuation ? " continued" : ""}</h2>
            {!continuation ? <h3 className="mt-3 text-xl font-black leading-snug text-[#2a211d]">{submission.headline}</h3> : null}
            {chunk.intro ? <p className="mt-4 whitespace-pre-line text-[14px] leading-6 text-slate-700">{chunk.intro}</p> : null}
          </div>
          {hero && !continuation ? (
            <figure className="overflow-hidden rounded bg-[#fff8f1] shadow-soft">
              <img src={hero.url} alt={hero.caption} className="h-52 w-full object-cover" />
              <figcaption className="px-3 py-2 text-xs font-black text-[#2a211d]">{hero.caption}</figcaption>
            </figure>
          ) : null}
        </div>

        {chunk.metrics.length ? (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {chunk.metrics.map((metric) => (
              <div key={metric.label} className="rounded bg-[#fff4eb] p-3 text-center">
                <p className="text-xl font-black text-mypal-orange">{metric.value || "-"}</p>
                <p className="mt-1 text-[10px] font-black uppercase leading-tight text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {chunk.bullets.length ? (
          <div className="mt-5">
            <h4 className="mb-3 text-base font-black text-[#2a211d]">Key updates</h4>
            <ul className="grid gap-2">
              {chunk.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 rounded border border-orange-100 bg-white p-3 text-[13px] font-semibold leading-5 text-slate-700">
                  <span className="mt-2 h-2 w-2 flex-none rounded-full bg-mypal-orange" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {chunk.images.slice(hero && !continuation ? 1 : 0).length ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {chunk.images.slice(hero && !continuation ? 1 : 0).map((image) => (
              <figure key={image.id} className="overflow-hidden rounded bg-[#fff8f1]">
                <img src={image.url} alt={image.caption} className="h-28 w-full object-cover" />
                <figcaption className="px-3 py-2 text-xs font-black leading-4 text-[#2a211d]">{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
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
      <span>myPAL Internal Newsletter • <a href={settings.websiteUrl}>{settings.websiteUrl}</a></span>
      <span>{page}</span>
    </footer>
  );
}

function SocialLinks({ settings, theme }: { settings: AdminSettings; theme: "light" | "dark" }) {
  const links = settings.socialLinks?.length ? settings.socialLinks : [{ id: "website", label: "Website", url: settings.websiteUrl }];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <a key={link.id} href={link.url} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${theme === "dark" ? "bg-white/10 text-white" : "bg-white text-[#2a211d]"}`}>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-mypal-orange text-[10px] text-white">{link.label.slice(0, 1).toUpperCase()}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

function buildSectionChunks(submission: Submission): SectionChunk[] {
  const hasImages = submission.images.length > 0;
  const introChunks = chunkWords(submission.intro, hasImages ? 90 : 135);
  const bulletChunks = chunkArray(submission.bullets, hasImages ? 4 : 5);
  const imageChunks = chunkArray(submission.images, 3);
  const pageCount = Math.max(1, introChunks.length, bulletChunks.length, imageChunks.length);

  return Array.from({ length: pageCount }, (_, index) => ({
    intro: introChunks[index] ?? "",
    bullets: bulletChunks[index] ?? [],
    metrics: index === 0 ? submission.metrics.slice(0, 3) : [],
    images: imageChunks[index] ?? []
  }));
}

function chunkWords(value: string, wordsPerChunk: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const chunks: string[] = [];
  for (let index = 0; index < words.length; index += wordsPerChunk) {
    chunks.push(words.slice(index, index + wordsPerChunk).join(" "));
  }
  return chunks;
}

function chunkArray<T>(items: T[], size: number) {
  if (!items.length) return [];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function formatIssueDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
