import { Hero } from "@/components/home/Hero";
import { FeatureTour } from "@/components/home/FeatureTour";
import { GymStory } from "@/components/home/GymStory";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import gymMap from "@/data/gym-map.json";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureTour />
      {/* Only the headline numbers are passed down; the dot grid loads lazily on the client. */}
      <GymStory headline={gymMap.headline} topStates={gymMap.topStates} />
      <Faq />
      <FinalCta />
    </>
  );
}
