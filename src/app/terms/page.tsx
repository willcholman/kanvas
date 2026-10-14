import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 14, 2026">
      <section>
        <h2>The waitlist</h2>
        <p>
          Joining the waitlist doesn&apos;t create an account or guarantee access on a specific date. We&apos;ll email
          you when Kanvas is available.
        </p>
      </section>
      <section>
        <h2>Using Kanvas</h2>
        <p>Full terms for the Kanvas app will be published here before launch.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          <a className="underline underline-offset-2" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
