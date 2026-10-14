"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const HOLD_MS = 2000;

/** The neon discipline word under "Kanvas tracks your:". Decorative; the full list is read once via sr-only text. */
export function RotatingWord({ words }: { words: readonly string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), HOLD_MS + (reduce ? 700 : 500));
    return () => window.clearInterval(id);
  }, [words.length, reduce]);

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.7 } },
        exit: { opacity: 0, transition: { duration: 0.7 } },
      }
    : {
        initial: { y: "70%", opacity: 0, filter: "blur(10px)" },
        animate: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
        exit: { y: "-70%", opacity: 0, filter: "blur(10px)", transition: { duration: 0.45, ease: [0.55, 0, 0.75, 0.2] as const } },
      };

  return (
    <span aria-hidden className="relative block h-[1.1em] w-full overflow-visible">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          className="absolute inset-x-0 top-0 block whitespace-nowrap text-neon"
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
