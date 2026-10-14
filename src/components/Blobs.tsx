"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Preset = "features" | "cta" | "coaches";

/**
 * Soft, blurred gradient blobs that sit behind glass. As the section scrolls through the
 * viewport they rise and gain a little color, so the glass visibly picks it up.
 */
export function Blobs({ preset = "features" }: { preset?: Preset }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-40, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -60]);
  const o = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], reduce ? [1, 1, 1, 1] : [0.35, 1, 1, 0.4]);

  const neon = (a: number) => `radial-gradient(closest-side, rgba(190,235,59,${a}), rgba(190,235,59,0))`;
  const gray = (a: number) => `radial-gradient(closest-side, rgba(10,10,10,${a}), rgba(10,10,10,0))`;

  const layouts: Record<Preset, { cls: string; bg: string; y: typeof y1; drift: string }[]> = {
    features: [
      { cls: "left-[-10%] top-[8%] h-[520px] w-[620px]", bg: neon(0.24), y: y1, drift: "blob-a" },
      { cls: "right-[-12%] top-[36%] h-[560px] w-[640px]", bg: gray(0.05), y: y2, drift: "blob-b" },
      { cls: "left-[30%] bottom-[-6%] h-[460px] w-[560px]", bg: neon(0.18), y: y3, drift: "blob-c" },
    ],
    cta: [
      { cls: "left-[8%] top-[0%] h-[420px] w-[520px]", bg: neon(0.22), y: y1, drift: "blob-a" },
      { cls: "right-[6%] bottom-[-10%] h-[440px] w-[540px]", bg: gray(0.045), y: y2, drift: "blob-b" },
    ],
    coaches: [
      { cls: "left-[-6%] top-[10%] h-[520px] w-[620px]", bg: neon(0.24), y: y1, drift: "blob-a" },
      { cls: "right-[-8%] top-[30%] h-[520px] w-[600px]", bg: gray(0.05), y: y2, drift: "blob-b" },
      { cls: "left-[35%] bottom-[-20%] h-[420px] w-[520px]", bg: neon(0.16), y: y3, drift: "blob-c" },
    ],
  };

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div style={{ opacity: o }} className="absolute inset-0">
        {layouts[preset].map((b, i) => (
          <motion.div key={i} style={{ y: b.y }} className={`absolute ${b.cls} max-w-[90vw]`}>
            <div className={`h-full w-full rounded-full blur-[60px] ${b.drift}`} style={{ background: b.bg }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
