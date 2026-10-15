/**
 * Testimonial cards that scroll over the gym map on the home page. Edit this file to swap in
 * real content.
 *
 * - photo: a path under /public/testimonials (e.g. "/testimonials/jordan.jpg"), or null
 *   to show the "Photo coming soon" placeholder. Use portrait photos, about 4:5.
 * - photoAlt: describe the photo for screen readers (e.g. "Jordan drilling guard passes").
 * - Copy rule: no em dashes.
 */
export type Testimonial = {
  photo: string | null;
  photoAlt: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    photo: null,
    photoAlt: "",
    quote: "Placeholder quote. Athlete testimonial goes here.",
  },
  {
    photo: null,
    photoAlt: "",
    quote: "Placeholder quote. Athlete testimonial goes here.",
  },
  {
    photo: null,
    photoAlt: "",
    quote: "Placeholder quote. Athlete testimonial goes here.",
  },
];
