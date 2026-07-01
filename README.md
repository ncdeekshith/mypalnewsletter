# myPAL Newsletter Generator

A full-stack MVP for collecting monthly department updates and producing a polished myPAL-branded newsletter PDF.

## Features

- Email/password demo login with Admin and Contributor roles
- Contributor monthly update form with validation for intro, 3 bullets, and 4 images
- Admin review workflow with Draft, Submitted, Approved, Rejected, and Published statuses
- Admin settings for brand assets, footer, social links, QR code, partner logos, and leadership profile
- Responsive newsletter preview using approved visible sections
- A4 PDF export through Playwright HTML-to-PDF
- Supabase-ready schema in `supabase/schema.sql`

## Demo Credentials

- Admin: `admin@mypal.in` / `admin123`
- Academic contributor: `academic@mypal.in` / `team123`
- Sales contributor: `sales@mypal.in` / `team123`
- Tech contributor: `tech@mypal.in` / `team123`
- Marketing contributor: `marketing@mypal.in` / `team123`

## Local Development

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Open `http://localhost:3000`.

## Production Notes

The MVP uses a local JSON store at `data/newsletter-db.json` so it runs immediately. For production, create the Supabase tables from `supabase/schema.sql`, add Supabase environment variables, and replace the store adapter in `src/lib/store.ts` with Supabase queries while keeping the same domain types.

PDF export requires a server runtime where Playwright Chromium can run. The generated file name follows:

`myPAL_Newsletter_<Month>_<Year>_Issue_<Number>.pdf`
