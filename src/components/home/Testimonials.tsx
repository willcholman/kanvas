import Image from "next/image";
import { TESTIMONIALS } from "@/content/testimonials";

/** Three separate cards. They scroll up over the pinned gym map (see GymStory). */
export function TestimonialCards() {
  return (
    <ul aria-label="What athletes say" className="flex flex-col items-center gap-[38svh]">
      {TESTIMONIALS.map((t, i) => (
        <li key={i} className="w-full max-w-[720px]">
          <figure className="grid gap-4 rounded-[24px] bg-white p-3 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_24px_64px_-24px_rgba(10,10,10,0.28)] ring-1 ring-ink/[0.06] sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] sm:gap-6 sm:p-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-mist">
              {t.photo ? (
                <Image src={t.photo} alt={t.photoAlt} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover object-[50%_30%]" />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="t-label text-ash">Photo coming soon</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between gap-8 px-2 pb-2 sm:px-0 sm:pt-3 sm:pr-3 sm:pb-1">
              <blockquote>
                <p className="text-[clamp(22px,2.2vw,30px)] leading-[1.2] font-medium tracking-[-0.02em]">
                  &ldquo;{t.quote.replace(/^["“]|["”]$/g, "")}&rdquo;
                </p>
              </blockquote>
              {(t.name || t.tag) && (
                <figcaption className="flex items-center justify-between gap-3">
                  {t.name && <span className="text-[15.6px] font-medium tracking-[-0.01em] text-ink">{t.name}</span>}
                  {t.tag && (
                    <span className="ml-auto rounded-md bg-mist px-2 py-1 text-[12px] font-medium tracking-[0.04em] text-ash">
                      {t.tag}
                    </span>
                  )}
                </figcaption>
              )}
            </div>
          </figure>
        </li>
      ))}
    </ul>
  );
}
