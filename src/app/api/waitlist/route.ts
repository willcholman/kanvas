import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { waitlistSchema, type WaitlistResponse } from "@/lib/waitlist";
import { rateLimit } from "@/lib/rate-limit";
import { confirmationEmail } from "@/lib/email";
import { SITE } from "@/content/site";

export const runtime = "nodejs";

const json = (body: WaitlistResponse, status = 200) => NextResponse.json(body, { status });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip)) return json({ status: "rate_limited" }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ status: "invalid", errors: { form: "Invalid request." } }, 400);
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return json({ status: "invalid", errors }, 400);
  }
  const v = parsed.data;

  // Honeypot filled: pretend it worked so bots learn nothing.
  if (v.company) return json({ status: "created" });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[waitlist] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
    return json({ status: "error" }, 503);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from("waitlist").insert({
    first_name: v.firstName,
    last_name: v.lastName || null,
    email: v.email,
    discipline: v.discipline,
    discipline_other: v.discipline === "Other" ? v.disciplineOther : null,
    role: v.role,
    source: v.source,
    utm_source: v.utm_source ?? null,
    utm_medium: v.utm_medium ?? null,
    utm_campaign: v.utm_campaign ?? null,
  });

  if (error) {
    // 23505 = unique_violation on email: already on the list.
    if (error.code === "23505") return json({ status: "exists" });
    console.error("[waitlist] insert failed", error);
    return json({ status: "error" }, 500);
  }

  // Confirmation email. A failure here never fails the signup.
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const from = process.env.WAITLIST_FROM_EMAIL || SITE.email;
      const { subject, html, text } = confirmationEmail(v.firstName);
      const resend = new Resend(resendKey);
      const { error: sendError } = await resend.emails.send({
        from: `Kanvas <${from}>`,
        to: v.email,
        replyTo: from,
        subject,
        html,
        text,
        headers: { "List-Unsubscribe": `<mailto:${from}?subject=Unsubscribe>` },
      });
      if (sendError) console.error("[waitlist] confirmation email failed", sendError);
    } catch (e) {
      console.error("[waitlist] confirmation email threw", e);
    }
  } else {
    console.warn("[waitlist] RESEND_API_KEY is not set; skipped confirmation email");
  }

  return json({ status: "created" }, 201);
}
