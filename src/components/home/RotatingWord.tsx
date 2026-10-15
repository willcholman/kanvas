"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const HOLD_MS = 2000;
const SLIDE = { duration: 0.42, ease: [0.65, 0, 0.35, 1] as const };

/**
 * The neon discipline word under "Kanvas tracks your:". One word at a time: the current word
 * slides up out of a clipped line, then the next slides up into it. Decorative; the full list is
 * read once via sr-only text.
 */
export function RotatingWord({ words }: { words: readonly string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), HOLD_MS + (reduce ? 900 : 840));
    return () => window.clearInterval(id);
  }, [words.length, reduce]);

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.45 } },
        exit: { opacity: 0, transition: { duration: 0.45 } },
      }
    : {
        initial: { y: "105%" },
        animate: { y: "0%", transition: SLIDE },
        exit: { y: "-105%", transition: SLIDE },
      };

  return (
    <span aria-hidden className="relative flex h-[1.15em] w-full justify-center overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={words[i]}
          className="block whitespace-nowrap text-center text-neon"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
