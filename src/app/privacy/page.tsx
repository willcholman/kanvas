import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRIVACY, PRIVACY_UPDATED } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={PRIVACY_UPDATED}>
      {PRIVACY.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{linkEmail(body)}</p>
        </section>
      ))}
    </LegalPage>
  );
}

const EMAIL = "contact@kanvasfit.com";

/** Turns the contact address in a paragraph into a mailto link. */
function linkEmail(text: string) {
  const parts = text.split(EMAIL);
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a
            key={i}
            className="underline underline-offset-2"
            href={`mailto:${EMAIL}`}
          >
            {EMAIL}
          </a>,
          part,
        ],
  );
}
