"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAQ } from "@/content/faq";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="px-5 py-28 sm:py-36">
      <div className="mx-auto max-w-[760px]">
        <h2 id="faq-title" className="t-h2 text-center">
          FAQ
        </h2>

        <ul className="mt-12 space-y-3 sm:mt-16">
          {FAQ.map((item, i) => {
            const open = openIndex === i;
            const btnId = `${base}-q${i}`;
            const panelId = `${base}-a${i}`;
            return (
              <li key={item.q} className={`glass rounded-[20px] transition-colors duration-300 ${open ? "bg-white/75" : ""}`}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-6 rounded-[20px] px-6 py-5 text-left sm:px-7 sm:py-6"
                  >
                    <span className="t-h3">{item.q}</span>
                    <span
                      aria-hidden
                      className={`relative grid size-8 shrink-0 place-items-center rounded-full border border-ink/10 transition-transform duration-300 ease-out ${open ? "rotate-45" : ""}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      key="panel"
                      // Same values on server and client (the first item renders open); reduced
                      // motion only changes timing, so the height snaps and the text fades.
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], height: reduce ? { duration: 0 } : undefined }}
                      className="overflow-hidden"
                    >
                      <p className="t-body max-w-[60ch] px-6 pb-6 text-ash sm:px-7 sm:pb-7">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
