import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { HEALTH_DATA, HEALTH_DATA_UPDATED } from "@/content/legal";

export const metadata: Metadata = {
  title: "Consumer Health Data Privacy Policy",
  alternates: { canonical: "/health-data" },
};

export default function HealthDataPage() {
  return (
    <LegalPage title="Consumer Health Data Privacy Policy" updated={HEALTH_DATA_UPDATED}>
      {HEALTH_DATA.map(([heading, body]) => (
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
