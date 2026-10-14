export const SITE = {
  name: "Kanvas",
  url: "https://kanvasfit.com",
  title: "Kanvas | Martial arts lives here",
  description:
    "Kanvas is the app for martial artists. Log your training, track your progress, and train with your gym. Join the waitlist.",
  email: "contact@kanvasfit.com",
  instagram: { handle: "@kanvasfit", url: "https://instagram.com/kanvasfit" },
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
