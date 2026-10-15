/**
 * The site's public origin, used for canonical URLs, the sitemap, share images, and email assets.
 * Override with NEXT_PUBLIC_SITE_URL. Otherwise Vercel's production domain is used (the
 * *.vercel.app URL today, kanvasfit.com once that domain is assigned to the project).
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://kanvasfit.com");

export const SITE = {
  name: "Kanvas",
  url: SITE_URL,
  title: "Kanvas | Martial arts lives here",
  description:
    "Kanvas is the app for martial artists. Log your training, track your progress, and train with your gym. Join the waitlist.",
  email: "contact@kanvasfit.com",
  instagram: { handle: "@kanvasfit", url: "https://instagram.com/kanvasfit" },
  tiktok: { handle: "@kanvasfit", url: "https://www.tiktok.com/@kanvasfit" },
} as const;

/** The disciplines rotated in the hero and offered in the waitlist form. */
export const DISCIPLINES = [
  "Jiu-Jitsu",
  "MMA",
  "Muay Thai",
  "Boxing",
  "Wrestling",
  "Kickboxing",
  "Judo",
] as const;
