-- Sovereign AI Journal — database schema
-- Run via `npm run db:migrate` (see scripts/migrate.ts), or paste directly
-- into the Vercel Postgres / Neon query console.

create extension if not exists pgcrypto;

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed', -- 'subscribed' | 'unsubscribed'
  source text default 'sovereign-dispatch',   -- where the signup came from
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Idempotent upgrade path: adds the column to a subscribers table that was
-- created before dispatch-sending existed, without touching fresh installs
-- (where the column already exists from the create table above).
alter table subscribers add column if not exists unsubscribe_token uuid default gen_random_uuid();
update subscribers set unsubscribe_token = gen_random_uuid() where unsubscribe_token is null;
alter table subscribers alter column unsubscribe_token set not null;

create index if not exists subscribers_created_at_idx on subscribers (created_at desc);
create unique index if not exists subscribers_unsubscribe_token_idx on subscribers (unsubscribe_token);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  parent_id uuid references comments (id) on delete cascade,
  author_name text not null,
  author_email text, -- optional, never displayed publicly; for moderation contact only
  body text not null,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz not null default now()
);

create index if not exists comments_post_slug_idx on comments (post_slug);
create index if not exists comments_status_idx on comments (status);
create index if not exists comments_created_at_idx on comments (created_at desc);

-- Newsletter issues. body_text is plain text with blank-line paragraph
-- breaks; it's rendered into the email HTML template at send time. Sending
-- is manual only — a dispatch is either a 'draft' being written or 'sent'.
create table if not exists dispatches (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_text text not null,
  status text not null default 'draft', -- 'draft' | 'sent'
  sent_at timestamptz,
  recipient_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dispatches_status_idx on dispatches (status);
