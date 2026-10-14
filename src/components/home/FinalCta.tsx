import { Blobs } from "../Blobs";
import { Reveal } from "../Reveal";
import { WaitlistButton } from "../waitlist/WaitlistButton";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden px-5 py-32 sm:py-44">
      <Blobs preset="cta" />
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <h2 id="cta-title" className="t-h2">
          Your training deserves a home.
        </h2>
        <WaitlistButton variant="dark" className="mt-10" />
      </Reveal>
    </section>
  );
}
