import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

// Fix or remove a gym listing (2026-11-20, docs/COMPLIANCE_RESEARCH.md T6 in the app repo). For gyms
// and owners without the app: no sign-in, one email. The app has the same option on every unclaimed
// gym page ("Fix or remove this listing"). Kanvas promises an answer within 7 days.
export const metadata: Metadata = {
  title: "Fix or remove a gym listing",
  alternates: { canonical: "/gym-listing" },
};

const EMAIL = "contact@kanvasfit.com";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Gym listing: fix or remove")}&body=${encodeURIComponent(
  "Gym name:\nCity and state:\nWhat should change (or remove it):\nYour connection to the gym (owner, coach, member):\n",
)}`;

const SECTIONS: readonly (readonly [string, string])[] = [
  [
    "Where listings come from",
    "Kanvas lists martial arts gyms so athletes can find them and log where they train. We built the listings from public business information: gyms' own websites, public directories and public social media pages, with map positions from the US Census Bureau's address service. A listing no one has claimed is not run or endorsed by the gym.",
  ],
  [
    "Fix or remove a listing",
    "If anything on your gym's listing is wrong, including its logo, or you want it taken off Kanvas, email us with the gym's name and city and what should change. You don't need an account. We correct or remove listings within 7 days.",
  ],
  [
    "Run the page yourself",
    "Owners and coaches can claim their gym in the Kanvas app: open the gym's page, tap the menu, and choose \"Own or coach here? Manage this gym\". Once verified you can update the details and logo, and see who trains there.",
  ],
];

export default function GymListingPage() {
  return (
    <LegalPage title="Fix or remove a gym listing" updated="November 20, 2026">
      {SECTIONS.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{body}</p>
        </section>
      ))}
      <p>
        <a className="underline underline-offset-2" href={MAILTO}>
          Email {EMAIL} about a listing
        </a>
      </p>
    </LegalPage>
  );
}
