import Image from "next/image";
import { TESTIMONIALS } from "@/content/testimonials";

/** Three separate cards. They scroll up over the pinned gym map (see GymStory). */
export function TestimonialCards() {
  return (
    <ul aria-label="What athletes say" className="flex flex-col items-center gap-[45svh]">
      {TESTIMONIALS.map((t, i) => (
        <li key={i} className="w-full max-w-[720px]">
          <figure className="grid gap-4 rounded-[24px] bg-white p-3 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_64px_-24px_rgba(10,10,10,0.28)] ring-1 ring-ink/[0.06] sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] sm:gap-6 sm:p-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-mist">
              {t.photo ? (
                <Image src={t.photo} alt={t.photoAlt} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="t-label text-ash">Photo coming soon</span>
                </div>
              )}
            </div>
            <blockquote className="px-2 pb-3 sm:px-0 sm:pt-3 sm:pr-4">
              <p className="text-[clamp(22px,2.2vw,30px)] leading-[1.2] font-medium tracking-[-0.02em]">
                &ldquo;{t.quote.replace(/^["“]|["”]$/g, "")}&rdquo;
              </p>
            </blockquote>
          </figure>
        </li>
      ))}
    </ul>
  );
}
