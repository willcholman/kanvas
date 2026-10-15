import Image from "next/image";
import { DISCIPLINES } from "@/content/site";
import { HeroVideo } from "./HeroVideo";
import { HeroFrame } from "./HeroFrame";
import { HeroEmailBar } from "./HeroEmailBar";
import { RotatingWord } from "./RotatingWord";
import poster from "../../../public/video/hero-poster.jpg";

const spoken = `${DISCIPLINES.slice(0, -1).join(", ")}, and ${DISCIPLINES[DISCIPLINES.length - 1]}`;

export function Hero() {
  return (
    <section id="hero" className="on-dark relative isolate flex min-h-[100svh] flex-col text-white">
      <HeroFrame>
        <Image src={poster} alt="" fill preload fetchPriority="high" sizes="100vw" quality={70} className="object-cover" />
        <HeroVideo />
        {/* Readability: darker at the center (behind the copy) and at the bottom (behind the email bar). */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.38) 60%, rgba(10,10,10,0.28) 100%), linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0) 28%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.75) 100%)",
          }}
        />
      </HeroFrame>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-5 pt-28 pb-36 text-center">
        <h1 className="t-display">
          Your app tracks runs.
          <br />
          <em className="italic">Not rounds.</em>
        </h1>

        <p className="mt-8 sm:mt-10">
          <span className="sr-only">Kanvas tracks your {spoken}.</span>
          <span aria-hidden className="block text-[clamp(16px,1.28vw,19px)] leading-[1.2] font-normal tracking-[-0.01em] text-white">
            Kanvas tracks your:
          </span>
          <span aria-hidden className="mt-1 block text-[clamp(29px,4vw,51px)] leading-[1.1] font-normal tracking-[-0.025em]">
            <RotatingWord words={DISCIPLINES} />
          </span>
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center px-5 sm:bottom-12">
        <HeroEmailBar />
      </div>
    </section>
  );
}
