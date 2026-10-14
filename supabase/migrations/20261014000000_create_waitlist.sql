-- Kanvas waitlist.
-- Row level security is on with no policies, so the public (anon) key can neither read nor
-- write. Only the server route, using the service role key, can insert.

create table public.waitlist (
  id               bigint generated always as identity primary key,
  first_name       text not null,
  last_name        text,
  email            text not null unique,
  discipline       text not null,
  discipline_other text,
  role             text not null default 'athlete' check (role in ('athlete','coach')),
  source           text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  created_at       timestamptz not null default now()
);

alter table public.waitlist enable row level security;
-- No public policies: only the server route (service role) can write. Nobody can read the list from the browser.

create index waitlist_created_at_idx on public.waitlist (created_at desc);
