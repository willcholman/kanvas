# Kanvas website

The marketing site and waitlist for Kanvas, the app for martial artists. Live at [kanvasfit.com](https://kanvasfit.com).

Next.js (App Router) + TypeScript + Tailwind CSS v4, `motion` for animation, Supabase for the waitlist, Resend for the confirmation email, deployed on Vercel.

## Run it locally

Requires Node 20 or newer (`node -v`). On Windows: `winget install OpenJS.NodeJS.LTS`.

```bash
npm install
cp .env.example .env.local   # then fill in the keys (see "Backend setup")
npm run dev                  # http://localhost:3000
```

Without `.env.local` the whole site works except the signup itself: the form shows its retry message because the API answers `503` until Supabase is configured.

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run build:map` | Rebuild `src/data/gym-map.json` from the gym spreadsheet |
| `npm run build:brand` | Re-trace the logos and regenerate favicons and the OG image |

## Edit content

| What | Where |
|---|---|
| Testimonial cards (photo, quote, optional name and tag chip; shown over the gym map) | `src/content/testimonials.ts`. Put photos in `public/testimonials/` and set `photo: "/testimonials/name.jpg"` plus a `photoAlt`. Portrait (about 4:5) works best. |
| FAQ | `src/content/faq.ts` |
| Rotating disciplines (hero and form options) | `DISCIPLINES` in `src/content/site.ts` |
| Site title, description, email, Instagram | `SITE` in `src/content/site.ts` |
| Site URL (canonical, sitemap, share image, email logo) | Automatic: Vercel's production domain. Set `NEXT_PUBLIC_SITE_URL` in Vercel to override. |
| Feature cards | `FEATURES` in `src/components/home/Features.tsx` |
| Privacy and Terms (currently drafts) | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` |
| Confirmation email | `src/lib/email.ts` (replace `[Kanvas LLC mailing address]` before launch, it is required by CAN-SPAM) |

Copy rules: no em dashes anywhere. Neon (`#ccff33`) is an accent only: the hero's rotating word, the map's heat glow, the footer wordmark gradient, the signup success check, and focus rings. Never use it for text on white.

## Rebuild the gym map

The map is precomputed at build time so no gym data ships to the browser except `{x, y, count}` per grid cell.

```bash
npm run build:map
```

`scripts/build-gym-map.ts`:

1. Reads `usa_combat_gyms_master.xlsx` (sheet `gyms`). Default path is `C:/Users/willc/Desktop/Kanvas USA Gym Database/usa_combat_gyms_master.xlsx`; override with `GYM_XLSX=/path/to/file.xlsx`.
2. Downloads the US Census 2024 ZCTA and Places Gazetteer files once (cached in `scripts/.cache/`, git-ignored) and geocodes each gym to its ZIP centroid, falling back to city + state.
3. Projects with `d3-geo` `geoAlbersUsa`, builds a dot grid clipped to the lower 48 (`us-atlas`), bins the gyms, and writes `src/data/gym-map.json`.

The last run: 11,233 gyms, 9,929 placed by ZIP, 1,060 by city + state, 244 skipped (no usable location). Alaska and Hawaii (192) count toward the total but aren't drawn. The headline number is the total rounded down to the nearest thousand (`11,000+`), and the map's screen-reader label names the top three states automatically (currently Texas, California, and Arizona).

Commit the regenerated JSON.

## Hero video

Source: `kanvas website hero video.mp4` (34.6 s, 1080p). The site uses **6.76 s to 23.36 s** (16.6 s: kickboxing on pads, heavy bag work, grappling, pad work). It's denoised lightly, has no audio, and is encoded two-pass:

| File | Size |
|---|---|
| `public/video/hero-1080.webm` (VP9) | 5.0 MB |
| `public/video/hero-1080.mp4` (H.264, faststart) | 5.3 MB |
| `public/video/hero-720.mp4` (mobile) | 2.6 MB |
| `public/video/hero-poster.jpg` (first frame of the loop) | 73 KB |

To re-cut (FFmpeg: `winget install Gyan.FFmpeg`):

```bash
ffmpeg -ss 6.76 -i source.mp4 -t 16.6 -an -vf "hqdn3d=3:3:8:8,scale=1920:-2" -c:v libx264 -preset slow -b:v 2650k -pass 1 -pix_fmt yuv420p -f null NUL
ffmpeg -ss 6.76 -i source.mp4 -t 16.6 -an -vf "hqdn3d=3:3:8:8,scale=1920:-2" -c:v libx264 -preset slow -b:v 2650k -pass 2 -pix_fmt yuv420p -movflags +faststart public/video/hero-1080.mp4
```

Use `scale=1280:-2` and `-b:v 1300k` for the 720p file, and `-c:v libvpx-vp9 -b:v 2500k -row-mt 1` for WebM.

Visitors with "reduce motion" turned on get the poster image instead of the video.

## Backend setup

### 1. Supabase (the waitlist table)

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project**. Name it `kanvas`, choose a strong database password (save it in your password manager), and pick the region closest to your users (for example `us-east-1`).
2. When it's ready, open **SQL Editor > New query**, paste the contents of `supabase/migrations/20261014000000_create_waitlist.sql`, and click **Run**. You should see "Success. No rows returned".
3. Open **Table Editor**. You should see `waitlist`, with RLS enabled and no policies. That's intended: the browser can't read or write it, only the server route can.
4. Open **Project Settings > API** (or **API Keys**) and copy:
   - **Project URL** into `SUPABASE_URL`
   - the **service_role** secret key into `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses RLS. Keep it server-side only (never prefix it with `NEXT_PUBLIC_`), and never commit it.

To see signups: **Table Editor > waitlist**, or export to CSV from there.

### 2. Resend (the confirmation email)

1. Sign up at [resend.com](https://resend.com) and open **Domains > Add domain**. Enter `kanvasfit.com`.
2. Resend shows a set of DNS records. Add each one at your domain registrar or DNS host (wherever `kanvasfit.com`'s DNS lives):
   - **DKIM**: a `TXT` record named like `resend._domainkey` with a long `p=...` value.
   - **SPF**: an `MX` record and a `TXT` record on the `send` subdomain (`send.kanvasfit.com`), with values like `feedback-smtp.us-east-1.amazonses.com` and `v=spf1 include:amazonses.com ~all`. Copy the exact values Resend shows you.
   - **DMARC** (recommended): a `TXT` record named `_dmarc` with value `v=DMARC1; p=none; rua=mailto:contact@kanvasfit.com`.
   - If `kanvasfit.com` already has an SPF record for another sender (for example Google Workspace), don't add a second SPF on the root. Resend's SPF goes on the `send` subdomain, so the two don't clash.
3. Click **Verify DNS records**. DNS can take minutes to a few hours. Wait until every record shows **Verified**.
4. Open **API Keys > Create API key** with "Sending access" for `kanvasfit.com`. Copy it into `RESEND_API_KEY`.
5. Make sure `contact@kanvasfit.com` is a real inbox you can read, since replies (including "unsubscribe") go there.

If the email fails to send, the signup still succeeds and the error is logged (Vercel > Project > Logs).

### 3. Environment variables

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret |
| `RESEND_API_KEY` | `re_...` |
| `WAITLIST_FROM_EMAIL` | `contact@kanvasfit.com` |

Put them in `.env.local` for local development, and in Vercel for production (below).

## Deploy (Vercel)

1. Push this repo to GitHub (`main`).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and **Import** the `kanvas` repository. Vercel detects Next.js automatically, so leave the build settings at their defaults.
3. Before clicking Deploy, open **Environment Variables** and add the four variables above (apply them to Production, Preview, and Development).
4. Click **Deploy**. You get a `*.vercel.app` URL. Test a signup there.
5. Turn on analytics: **Project > Analytics > Enable**. Signups are tracked as the custom event `waitlist_signup` with `role` and `source`.
6. Connect the domain: **Project > Settings > Domains**, then add `kanvasfit.com` and `www.kanvasfit.com`. Vercel shows the DNS records to add at your registrar, typically:
   - `kanvasfit.com`: an `A` record to `76.76.21.21`
   - `www`: a `CNAME` to `cname.vercel-dns.com`

   Use the exact values Vercel shows. Set `kanvasfit.com` as the primary domain so `www` redirects to it, which matches the canonical URL.
7. Remove the old GitHub Pages setup: GitHub repo > **Settings > Pages**, set Source to **None**, and delete any old `CNAME`/`A` records that pointed at GitHub Pages (`185.199.108-111.153`).

Every push to `main` deploys to production, and every other branch gets a preview URL.

## Notes

- **Rate limiting** in `/api/waitlist` is per IP and in-memory (5 tries per 10 minutes per instance). That's enough to stop a single noisy client. If you see abuse, move it to Vercel Firewall rules or Upstash Redis.
- **Honeypot**: a hidden `company` field. If it's filled, the API returns success without saving anything.
- **Accessibility**: one `h1` per page, landmarks, keyboard-only use works (including the modal's focus trap and the FAQ), and focus rings are an ink outline with a neon halo. Reduced motion is respected everywhere.
- **Fonts**: Inter Tight (via `next/font`) stands in for Helvetica, with `"Helvetica Neue", Helvetica, Arial` as the fallback.
