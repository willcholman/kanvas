/**
 * Testimonial cards that scroll over the gym map on the home page. Edit this file to swap in
 * real content.
 *
 * - photo: a path under /public/testimonials (e.g. "/testimonials/jordan.jpg"), or null
 *   to show the "Photo coming soon" placeholder. Use portrait photos, about 4:5.
 * - photoAlt: describe the photo for screen readers (e.g. "Jordan drilling guard passes").
 * - name: shown bottom-left of the quote (optional).
 * - tag: small chip shown bottom-right, e.g. the discipline (optional).
 * - Copy rule: no em dashes.
 */
export type Testimonial = {
  photo: string | null;
  photoAlt: string;
  quote: string;
  name?: string;
  tag?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    photo: "/testimonials/ben-h.jpg",
    photoAlt: "Ben H. in a white gi and blue belt, holding his Brazilian Jiu-Jitsu belt certificate",
    quote: "Keeping track of my progress helps me stay focused and reach my goals.",
    name: "Ben H.",
    tag: "BJJ",
  },
  {
    photo: "/testimonials/ashley-s.jpg",
    photoAlt: "Ashley S. smiling as she lands a kick on pads in a Muay Thai ring",
    quote: "Sharing my sessions to my story keeps me accountable, and my friends always hype me up.",
    name: "Ashley S.",
    tag: "Muay Thai",
  },
  {
    photo: "/testimonials/will-h.jpg",
    photoAlt: "Will H. training high kicks with a partner on the mats",
    quote:
      "Being able to connect with gym friends and schedule training sessions makes me get out and train more often.",
    name: "Will H.",
    tag: "MMA",
  },
];
