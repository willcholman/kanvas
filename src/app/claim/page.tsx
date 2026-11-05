import type { Metadata } from "next";
import { ClaimLink } from "@/components/claim/ClaimLink";

export const metadata: Metadata = {
  title: "Gym claim",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Behind the links in Kanvas gym claim emails. Everything happens in the browser: the token sits
 *  after the # so it never reaches a server log. */
export default function ClaimPage() {
  return <ClaimLink />;
}
