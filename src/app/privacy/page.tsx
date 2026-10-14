import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 14, 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you join the waitlist we collect your first and last name, email address, the martial art you train,
          whether you signed up as an athlete or a coach, and the page and campaign that brought you here.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>
          We use your email only to tell you when Kanvas launches. We don&apos;t sell your information, and you can
          unsubscribe from any email at any time.
        </p>
      </section>
      <section>
        <h2>Teens</h2>
        <p>Kanvas is for ages 13 and up, with extra privacy protections for anyone under 18.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions or requests to delete your data:{" "}
          <a className="underline underline-offset-2" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
