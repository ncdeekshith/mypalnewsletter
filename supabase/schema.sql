create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'contributor')),
  department_id uuid,
  created_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section_title text not null,
  owner_title text not null,
  sort_order int not null default 0
);

create table public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  month text not null,
  year int not null,
  publish_date date not null,
  issue_number text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.newsletter_issues(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  section_title text not null,
  headline text not null,
  intro text not null,
  bullets jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'published')),
  visible boolean not null default true,
  sort_order int not null default 10,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submission_images (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  caption text not null,
  sort_order int not null default 0
);

create table public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  company_logo_url text not null,
  title text not null,
  footer_text text not null,
  website_url text not null,
  social_handle text not null,
  qr_code_url text not null,
  brand_primary text not null default '#f47b20',
  brand_secondary text not null default '#1f2a44',
  typography text not null default 'Inter',
  leadership jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partner_logos (
  id uuid primary key default gen_random_uuid(),
  admin_settings_id uuid references public.admin_settings(id) on delete cascade,
  name text not null,
  image_url text not null,
  kind text not null default 'partner' check (kind in ('partner', 'recognition')),
  sort_order int not null default 0
);

create table public.generated_pdfs (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.newsletter_issues(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);
