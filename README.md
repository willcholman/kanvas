# Kanvas — marketing site

One-page pitch site for Kanvas, the social training app for martial arts.
Static HTML/CSS/JS. No build step, no dependencies to install.

```
index.html
assets/
  css/style.css
  js/main.js          ← waitlist config lives at the top of this file
  img/                web-sized photography
  brand/              logo, brandmark, app icon, favicon
  fonts/              ← drop licensed Tenon .woff2 files here
_source/              original full-size images (not deployed)
```

## Run it locally

This machine has no Node or Python, so a small PowerShell server is included:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open `http://localhost:4321`. Any other static server works too
(`python -m http.server 4321`, `npx serve`). Opening `index.html` directly over
`file://` will **not** work — the browser blocks the stylesheet and script.

## Fonts

The brief specifies **Tenon**, which is a licensed typeface and cannot be
bundled here. The stylesheet already declares `@font-face` rules for it, so:

1. Buy/export Tenon as `.woff2`.
2. Drop the files into `assets/fonts/` with these exact names:
   `Tenon-Light.woff2`, `Tenon-Regular.woff2`, `Tenon-Medium.woff2`,
   `Tenon-Bold.woff2`, `Tenon-Black.woff2`.

No other change is needed — the whole site picks them up.

Until then it falls through to **Figtree** (loaded from Google Fonts), which
shares Tenon's humanist-geometric skeleton. Data, labels and numbers are set in
**JetBrains Mono** by design, not as a fallback.

## Colour

| Token     | Value     | Use                                    |
|-----------|-----------|----------------------------------------|
| `--volt`  | `#fffc00` | brand yellow                           |
| `--ink`   | `#0a0a0a` | page black                             |
| `--paper` | `#ffffff` | white                                  |

The brief wrote the yellow as `#ffc00`, which is five digits and not a valid
hex colour. The brand board image reads `#fffc00`, so that is what is used.
Change `--volt` in `assets/css/style.css` if that is wrong.

Greys (`--ash`, `--ash-dim`) are utility values derived from ink, chosen to
clear WCAG AA against the black background.

## Wiring up the sign-up form

The form validates and handles its own success/error states, but it needs
somewhere to send addresses. Open `assets/js/main.js` and fill in **one** of
the two options in `CONFIG` at the top.

### Option A — Supabase

Create a table, then paste the project URL and publishable (anon) key into
`CONFIG.supabase`.

```sql
create table public.waitlist (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  discipline  text,
  source      text,
  created_at  timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- anonymous visitors may add themselves and nothing else
create policy "anon can join waitlist"
  on public.waitlist for insert to anon with check (true);
```

RLS with an insert-only policy is what makes it safe to ship the anon key in
the browser: visitors can add a row, but cannot read the list back.

### Option B — any other endpoint

Set `CONFIG.endpoint` to a Formspree / Buttondown / custom URL. The form POSTs
JSON: `{ email, discipline, source }`.

Until one of these is set, the form tells the visitor sign-up is not live yet
and logs the captured address to the console for you.

## Deploying

Upload the folder to Netlify, Vercel, Cloudflare Pages, or any static host.
`_source/` holds the original full-resolution images and can be excluded.

Before going live, replace the placeholder `og:image` URL in `index.html` with
an absolute URL on your domain — social previews need one.

## Notes on behaviour

- The hero uses the brandmark as a CSS mask that opens on load. If masking is
  unsupported the photo simply shows, and a 3.2s timeout clears the mask either
  way so the hero can never get stuck.
- Feature copy and the phone screen are synced by `IntersectionObserver`; the
  trigger band sits lower on narrow screens because the phone is pinned to the
  top there.
- `prefers-reduced-motion` disables the hero sequence, scroll reveals and the
  marquee.
- The phone mockups are pure HTML/CSS, so screen copy is edited in
  `index.html`, not in an image editor.
