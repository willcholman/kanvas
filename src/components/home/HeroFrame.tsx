"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * The hero's media layer. As the page scrolls, it pulls in from the edges and its corners round
 * off, so the video settles into a soft frame on the white page (echoing the rounded wordmark).
 */
export function HeroFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Fully framed after roughly the first fifth of the hero has scrolled away.
  const p = useTransform(scrollYProgress, [0, 0.22], [0, 1], { clamp: true });

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden bg-ink [--hero-inset:10px] [--hero-radius:28px] sm:[--hero-inset:20px] sm:[--hero-radius:44px]"
      style={{
        ["--hp" as string]: p,
        clipPath: "inset(calc(var(--hp) * var(--hero-inset)) round calc(var(--hp) * var(--hero-radius)))",
      }}
    >
      {children}
    </motion.div>
  );
}
