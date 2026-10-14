import { SITE } from "@/content/site";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FONT = `'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

/** Mailing address shown in every email (CAN-SPAM). Replace before launch. */
export const MAILING_ADDRESS = "[Kanvas LLC mailing address]";

export function confirmationEmail(firstName: string) {
  const name = esc(firstName.trim() || "there");
  const subject = "You're on the Kanvas waitlist";

  const text = `Hi ${firstName.trim() || "there"},

You're on the Kanvas waitlist. We'll email you as soon as Kanvas launches on iPhone and Android.

Until then, follow along on Instagram: ${SITE.instagram.url}

The Kanvas team

You're getting this because you joined the Kanvas waitlist at kanvasfit.com. To unsubscribe, reply with "unsubscribe" or email ${SITE.email}.
${MAILING_ADDRESS}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${subject}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#ffffff;color:#0a0a0a;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">We'll email you when Kanvas launches.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
  <tr>
    <td align="center" style="padding:48px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td style="padding-bottom:40px;">
            <img src="${SITE.url}/brand/kanvas-mark-black-96.png" width="40" height="40" alt="Kanvas" style="display:block;border:0;">
          </td>
        </tr>
        <tr>
          <td style="font-family:${FONT};font-size:32px;line-height:1.1;font-weight:600;letter-spacing:-0.03em;color:#0a0a0a;padding-bottom:20px;">
            You're on the list, ${name}.
          </td>
        </tr>
        <tr>
          <td style="font-family:${FONT};font-size:17px;line-height:1.55;color:#0a0a0a;padding-bottom:16px;">
            Thanks for joining the Kanvas waitlist. We'll email you as soon as Kanvas launches on iPhone and Android, so you can start logging every round.
          </td>
        </tr>
        <tr>
          <td style="font-family:${FONT};font-size:17px;line-height:1.55;color:#0a0a0a;padding-bottom:36px;">
            Until then, follow along on Instagram at <a href="${SITE.instagram.url}" style="color:#0a0a0a;text-decoration:underline;">${SITE.instagram.handle}</a>.
          </td>
        </tr>
        <tr>
          <td style="font-family:${FONT};font-size:17px;line-height:1.55;color:#0a0a0a;padding-bottom:48px;">
            The Kanvas team
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e6e6e3;padding-top:24px;font-family:${FONT};font-size:13px;line-height:1.6;color:#6b6b6b;">
            You're getting this because you joined the Kanvas waitlist at kanvasfit.com.
            To unsubscribe, reply with "unsubscribe" or email <a href="mailto:${SITE.email}?subject=Unsubscribe" style="color:#6b6b6b;">${SITE.email}</a>.<br>
            ${esc(MAILING_ADDRESS)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
