import { z } from "zod";
import { DISCIPLINES } from "@/content/site";

export const DISCIPLINE_OPTIONS = [...DISCIPLINES, "Other"] as const;

/** Server-side validation for POST /api/waitlist. */
export const waitlistSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name.").max(80),
    lastName: z.string().trim().max(80).optional().default(""),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
    discipline: z.enum(DISCIPLINE_OPTIONS, { message: "Choose your martial art." }),
    disciplineOther: z.string().trim().max(80).optional().default(""),
    role: z.enum(["athlete", "coach"]).default("athlete"),
    source: z.string().trim().max(200).optional().default("/"),
    utm_source: z.string().trim().max(200).optional(),
    utm_medium: z.string().trim().max(200).optional(),
    utm_campaign: z.string().trim().max(200).optional(),
    /** Honeypot. Real people never see or fill this. */
    company: z.string().optional().default(""),
  })
  .refine((v) => v.discipline !== "Other" || v.disciplineOther.length > 0, {
    path: ["disciplineOther"],
    message: "Tell us which martial art.",
  });

export type WaitlistInput = z.input<typeof waitlistSchema>;

export type WaitlistResponse =
  | { status: "created" }
  | { status: "exists" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "rate_limited" }
  | { status: "error" };
