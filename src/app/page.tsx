import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { GymMap } from "@/components/home/GymMap";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import gymMap from "@/data/gym-map.json";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      {/* Only the headline numbers are passed down; the dot grid loads lazily on the client. */}
      <GymMap headline={gymMap.headline} topStates={gymMap.topStates} />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
