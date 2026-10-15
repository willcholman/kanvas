import type { Metadata } from "next";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Tools for coaches and gyms are on the way. Join the Kanvas waitlist.",
  alternates: { canonical: "/coaches" },
};

export default function CoachesPage() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pt-28 pb-20">
      <div className="glass w-full max-w-[560px] rounded-[32px] px-8 py-14 text-center sm:px-14 sm:py-20">
        <p className="t-label text-ash">For coaches</p>
        <h1 className="t-h2 mt-4">Coming soon.</h1>
        <p className="t-body mx-auto mt-4 max-w-[36ch] text-ash">Tools for coaches and gyms are on the way.</p>
        <WaitlistButton variant="dark" role="coach" className="mt-10" />
      </div>
    </section>
  );
}
