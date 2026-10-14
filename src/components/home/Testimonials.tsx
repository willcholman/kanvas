import Image from "next/image";
import { TESTIMONIALS } from "@/content/testimonials";
import { Reveal } from "../Reveal";

export function Testimonials() {
  return (
    <section aria-label="What athletes say" className="px-5 py-12 sm:py-20">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-24 sm:gap-36">
        {TESTIMONIALS.map((t, i) => {
          const flip = i % 2 === 1;
          return (
            <Reveal as="figure" key={i} className="grid gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
              <div className={`md:col-span-5 ${flip ? "md:order-2 md:col-start-8" : ""}`}>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-mist">
                  {t.photo ? (
                    <Image src={t.photo} alt={t.photoAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="t-label text-ash">Photo coming soon</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex flex-col md:col-span-7 md:justify-between md:py-6 ${flip ? "md:order-1" : ""}`}>
                <blockquote className="t-quote max-w-[20ch]">
                  <p>&ldquo;{t.quote.replace(/^["“]|["”]$/g, "")}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                  <span className="text-[17px] font-semibold tracking-[-0.01em]">{t.name}</span>
                  <span className="t-label rounded-full bg-mist px-3 py-1.5 text-ash">
                    {t.discipline} · {t.gym}
                  </span>
                </figcaption>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
