import Image from "next/image";
import { DISCIPLINES } from "@/content/site";
import { WaitlistButton } from "../waitlist/WaitlistButton";
import { HeroVideo } from "./HeroVideo";
import { RotatingWord } from "./RotatingWord";
import poster from "../../../public/video/hero-poster.jpg";

const spoken = `${DISCIPLINES.slice(0, -1).join(", ")}, and ${DISCIPLINES[DISCIPLINES.length - 1]}`;

export function Hero() {
  return (
    <section id="hero" className="on-dark relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink text-white">
      <Image
        src={poster}
        alt=""
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        quality={70}
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10">
        <HeroVideo />
      </div>

      {/* Readability: darker at the center (behind the copy) and at the bottom. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.38) 60%, rgba(10,10,10,0.28) 100%), linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0) 28%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.75) 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-5 pt-28 pb-24 text-center">
        <h1 className="t-display">
          Your app tracks runs.
          <br />
          Not rounds.
        </h1>

        <p className="mt-10 sm:mt-12">
          <span className="sr-only">Kanvas tracks your {spoken}.</span>
          <span aria-hidden className="t-h3 block text-white">
            Kanvas tracks your:
          </span>
          <span aria-hidden className="mt-1 block text-[clamp(36px,5vw,64px)] leading-[1.1] font-semibold tracking-[-0.03em]">
            <RotatingWord words={DISCIPLINES} />
          </span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
          <WaitlistButton variant="light" />
          <p className="text-[14px] text-white/70">Coming soon to iPhone and Android.</p>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#what-you-get"
        aria-label="Scroll to features"
        className="absolute bottom-7 left-1/2 flex h-10 w-6 -translate-x-1/2 justify-center overflow-hidden rounded-full border border-white/35"
      >
        <span className="scroll-cue-dot mt-2 block h-2 w-[3px] rounded-full bg-white/80" />
      </a>
    </section>
  );
}
