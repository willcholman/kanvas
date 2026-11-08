import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { TERMS, TERMS_UPDATED } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated={TERMS_UPDATED}>
      {TERMS.map(([heading, body]) => (
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
