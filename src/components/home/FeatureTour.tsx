"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { FEATURES } from "@/content/features";
import { PhoneFrame, PhoneScreen } from "./PhoneFrame";

/*
 * Pinned scroll tour. The stage sticks for the length of the section while scroll progress drives
 * a timeline measured in "screens" (one screen = one viewport of scrolling):
 *
 *   0.00 - 0.30  "Built for how you train." sits centered
 *   0.30 - 1.00  it shrinks into a small label at the top of the text column; the phone rises in
 *   the label fades out as the first feature leaves, before the second one arrives
 *   then, per feature: hold ~0.6 (phone settled at that feature's pose, text readable), move 0.4
 *   (phone swings to the next pose, the screen pushes to the next feature, the text swaps)
 *
 * SCROLL sets how much real scrolling one timeline screen takes, so it speeds up the whole tour.
 */
const N = FEATURES.length;
const INTRO_HOLD = 0.3;
const INTRO = 0.7;
const HOLD = 0.6;
const MOVE = 0.4;
const FIRST = INTRO_HOLD + INTRO; // first feature settled
const TOTAL = FIRST + HOLD + (N - 1) * (MOVE + HOLD); // timeline length, in screens
const SCROLL = 0.595; // viewports of scrolling per timeline screen

/** Where the phone rests for each feature, in degrees. Never head on; it swings between these. */
const POSES = [
  { rx: 6, ry: -16, rz: 2 },
  { rx: 4, ry: 14, rz: -1.5 },
  { rx: 9, ry: -9, rz: -2.5 },
  { rx: 3, ry: 12, rz: 1.5 },
];
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
function poseAt(f: number, key: "rx" | "ry" | "rz") {
  const i = Math.min(Math.floor(f), N - 1);
  const j = Math.min(i + 1, N - 1);
  return lerp(POSES[i][key], POSES[j][key], f - i);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Feature position as a float: 0 = first feature, 1 = second, ... Fractions are mid-move. */
function featureAt(t: number) {
  let f = 0;
  for (let k = 0; k < N - 1; k++) {
    const start = FIRST + HOLD + k * (MOVE + HOLD);
    f += smooth(seg(t, start, start + MOVE));
  }
  return f;
}

export function FeatureTour() {
  const reduce = useReducedMotion();
  // The server can't know the visitor's motion setting, so the first render always matches the
  // server's (pinned) markup; the static version swaps in right after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (mounted && reduce) return <StaticTour />;
  return <PinnedTour />;
}

function PinnedTour() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);

  // Geometry for the heading's centered start and its label-sized end, re-measured on resize.
  const geo = useRef({ cx: 0, cy: 0, sx: 0, sy: 0, s: 0.3, vh: 800 });
  const tick = useMotionValue(0);
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current, head = headRef.current, slot = slotRef.current;
      if (!stage || !head || !slot) return;
      const st = stage.getBoundingClientRect();
      const w = head.offsetWidth, h = head.offsetHeight;
      const sl = slot.getBoundingClientRect();
      const s = sl.width / w;
      geo.current = {
        cx: (st.width - w) / 2,
        cy: (st.height - h) / 2,
        sx: sl.left - st.left,
        sy: sl.top - st.top + (sl.height - h * s) / 2,
        s,
        vh: st.height,
      };
      tick.set(tick.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    if (slotRef.current) ro.observe(slotRef.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [tick]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const t = useTransform(scrollYProgress, (p) => p * TOTAL);

  // Heading: centered, then shrinks and slides into the label slot.
  const headA = useTransform([t, tick] as MotionValue[], ([v]: number[]) => smooth(seg(v, INTRO_HOLD, INTRO_HOLD + INTRO * 0.8)));
  const headX = useTransform([headA, tick] as MotionValue[], ([a]: number[]) => geo.current.cx + (geo.current.sx - geo.current.cx) * a);
  const headY = useTransform([headA, tick] as MotionValue[], ([a]: number[]) => geo.current.cy + (geo.current.sy - geo.current.cy) * a);
  const headS = useTransform([headA, tick] as MotionValue[], ([a]: number[]) => 1 + (geo.current.s - 1) * a);
  const headColor = useTransform(headA, [0, 1], ["#0a0a0a", "#6b6b6b"]);

  // Phone: rises from below, tilting flat as it lands; then drifts and tilts between features.
  const rise = useTransform(t, (v) => easeOut(seg(v, INTRO_HOLD + INTRO * 0.25, FIRST)));
  const f = useTransform(t, featureAt);
  const phoneY = useTransform([rise, f, tick] as MotionValue[], ([r, ff]: number[]) => {
    const mid = Math.sin(Math.PI * (ff % 1)); // 0 at each stop, 1 halfway between
    const dir = Math.floor(ff) % 2 === 0 ? -1 : 1;
    return (1 - r) * geo.current.vh * 0.75 + mid * dir * 26;
  });
  // Each stop has its own pose; mid-move the phone tips back a little more as it swings across.
  const phoneRX = useTransform([rise, f] as MotionValue[], ([r, ff]: number[]) => (1 - r) * 24 + poseAt(ff, "rx") + Math.sin(Math.PI * (ff % 1)) * 4);
  const phoneRY = useTransform(f, (ff) => poseAt(ff, "ry"));
  const phoneRZ = useTransform(f, (ff) => poseAt(ff, "rz"));
  const phoneOpacity = useTransform(rise, [0, 0.25], [0, 1]);
  // The lime glow trails the phone: it rises with it and leans toward the side the phone faces.
  const glowX = useTransform(f, (ff) => poseAt(ff, "ry") * -1.2);
  const glowOpacity = useTransform(rise, [0.1, 0.8], [0, 1]);
  const textIn = useTransform(t, (v) => smooth(seg(v, FIRST - 0.2, FIRST + 0.05)));
  // The label leaves with the first feature: gone by the time the second feature's text appears.
  const headOpacity = useTransform(f, (v) => 1 - smooth(seg(v, 0.05, 0.42)));

  return (
    <section
      ref={sectionRef}
      id="what-you-get"
      aria-labelledby="features-title"
      className="relative"
      style={{ height: `${(TOTAL * SCROLL + 1) * 100}svh` }}
    >
      {/* Clipped sideways only: the lime glow may spill below the stage, so it trails into the next
          section as the tour unpins instead of ending in a hard edge. */}
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-x-clip">
        {/* Heading: one element, transformed from centered to label size. */}
        <motion.h2
          ref={headRef}
          id="features-title"
          className="t-h2 absolute top-0 left-0 z-10 origin-top-left whitespace-nowrap max-md:text-[7.2vw]"
          style={{ x: headX, y: headY, scale: headS, color: headColor, opacity: headOpacity }}
        >
          Built for how you train.
        </motion.h2>

        <div className="mx-auto grid h-full w-full max-w-[1120px] grid-rows-[auto_1fr_auto] px-5 pt-24 pb-6 md:grid-cols-[1fr_auto] md:grid-rows-1 md:items-center md:gap-16 md:pt-20 md:pb-0">
          {/* Text column: the label slot sits above the feature text. */}
          <div className="relative flex flex-col items-center text-center md:order-1 md:items-start md:text-left">
            <span ref={slotRef} aria-hidden className="invisible text-[15px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap md:text-[16px]">
              Built for how you train.
            </span>
            <motion.ol className="relative mt-4 hidden h-[255px] w-full max-w-[500px] md:block" style={{ opacity: textIn }}>
              {FEATURES.map((feat, i) => (
                <FeatureText key={feat.title} index={i} f={f} feature={feat} />
              ))}
            </motion.ol>
          </div>

          {/* Phone */}
          <div className="relative flex min-h-0 items-center justify-center [perspective:1600px] md:order-2">
            <motion.div
              aria-hidden
              className="lime-glow pointer-events-none absolute top-1/2 left-1/2 aspect-[1/1] h-[min(67svh,667px)] -translate-x-1/2 -translate-y-1/2 md:h-[min(92svh,851px)]"
              style={{ x: glowX, y: phoneY, opacity: glowOpacity }}
            />
            <motion.div
              className="h-[min(56svh,560px)] md:h-[min(78svh,720px)]"
              style={{ y: phoneY, rotateX: phoneRX, rotateY: phoneRY, rotateZ: phoneRZ, opacity: phoneOpacity, transformStyle: "preserve-3d" }}
            >
              <PhoneFrame className="h-full">
                {FEATURES.map((feat, i) => (
                  <Screen key={feat.screen} index={i} f={f} src={feat.screen} alt={feat.screenAlt} topColor={feat.topColor} />
                ))}
              </PhoneFrame>
            </motion.div>
          </div>

          {/* Mobile text, under the phone */}
          <motion.ol className="relative mt-5 h-[165px] w-full md:hidden" style={{ opacity: textIn }}>
            {FEATURES.map((feat, i) => (
              <FeatureText key={feat.title} index={i} f={f} feature={feat} centered />
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

function FeatureText({ index, f, feature, centered = false }: { index: number; f: MotionValue<number>; feature: (typeof FEATURES)[number]; centered?: boolean }) {
  const opacity = useTransform(f, (v) => clamp01(1 - Math.abs(index - v) * 2.2));
  const y = useTransform(f, (v) => (index - v) * 36);
  return (
    <motion.li className={`absolute inset-x-0 top-0 ${centered ? "text-center" : ""}`} style={{ opacity, y }}>
      <h3 className="t-feature-title text-ink">{feature.title}</h3>
      <p className={`t-feature-body mt-3 text-ash md:mt-4 ${centered ? "mx-auto max-w-[34ch]" : "max-w-[40ch]"}`}>{feature.body}</p>
    </motion.li>
  );
}

/** One app screen inside the phone. Moving forward pushes it in from the right, like iOS navigation. */
function Screen({ index, f, src, alt, topColor }: { index: number; f: MotionValue<number>; src: string; alt: string; topColor: string }) {
  const x = useTransform(f, (v) => {
    const d = index - v;
    return d >= 0 ? `${Math.min(d, 1) * 100}%` : `${Math.max(d, -1) * 30}%`;
  });
  const dim = useTransform(f, (v) => clamp01((v - index) * 0.6)); // outgoing screen darkens slightly
  return (
    <motion.div className="absolute inset-0" style={{ x, zIndex: index }}>
      <PhoneScreen topColor={topColor}>
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 340px, 260px" className="object-cover object-top" />
      </PhoneScreen>
      <motion.div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: dim }} />
    </motion.div>
  );
}

/** Reduced motion: no pinning or movement, just each feature next to its screen. */
function StaticTour() {
  return (
    <section id="what-you-get" aria-labelledby="features-title" className="px-5 py-28 sm:py-36">
      <h2 id="features-title" className="t-h2 text-center">
        Built for how you train.
      </h2>
      <ol className="mx-auto mt-16 flex max-w-[1000px] flex-col gap-20">
        {FEATURES.map((feat) => (
          <li key={feat.title} className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-16">
            <div className="text-center md:text-left">
              <h3 className="t-feature-title">{feat.title}</h3>
              <p className="t-feature-body mx-auto mt-3 max-w-[40ch] text-ash md:mx-0">{feat.body}</p>
            </div>
            <div className="relative mx-auto">
              <div aria-hidden className="lime-glow pointer-events-none absolute top-1/2 left-1/2 aspect-[1/1] h-[117%] -translate-x-1/2 -translate-y-1/2" />
              <PhoneFrame className="relative h-[560px] md:h-[620px]">
                <PhoneScreen topColor={feat.topColor}>
                  <Image src={feat.screen} alt={feat.screenAlt} fill sizes="300px" className="object-cover object-top" />
                </PhoneScreen>
              </PhoneFrame>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
