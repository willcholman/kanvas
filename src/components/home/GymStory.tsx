import { GymMap } from "./GymMap";
import { TestimonialCards } from "./Testimonials";

/**
 * The map pins in place once it's centered, the testimonial cards scroll up over it, and once
 * the last card has left the screen the map scrolls away normally.
 *
 * How: the map lives in a 100svh sticky layer. The cards follow it in normal flow, so they start
 * just below the screen, and the bottom padding (one screen tall) keeps the map pinned until the
 * last card has fully scrolled off the top.
 */
export function GymStory({ headline, topStates }: { headline: number; topStates: string[] }) {
  return (
    <section id="gyms" aria-labelledby="gyms-title" className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-5 pt-20 pb-6">
        <GymMap headline={headline} topStates={topStates} />
      </div>
      {/* Top padding holds the cards back until the pinned intro (heading, subline, map) has played.
          The layer lets the mouse through to the map; the cards themselves stay interactive. */}
      <div className="pointer-events-none relative z-10 px-5 pt-[125svh] pb-[100svh]">
        <TestimonialCards />
      </div>
    </section>
  );
}
