"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type MapData = {
  width: number;
  height: number;
  step: number;
  total: number;
  headline: number;
  topStates: string[];
  cells: [number, number, number][];
};

// Dimensions mirror scripts/build-gym-map.ts so the box is reserved before the data loads.
const W = 1000;
const H = 620;

const fmt = new Intl.NumberFormat("en-US");

function listOf(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function GymMap({ headline, topStates }: { headline: number; topStates: string[] }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const near = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const headingIn = useInView(numRef, { once: true, margin: "0px 0px -15% 0px" });
  const mapIn = useInView(mapRef, { once: true, margin: "0px 0px -20% 0px" });
  const [data, setData] = useState<MapData | null>(null);

  // Load the precomputed grid only when the section is close.
  useEffect(() => {
    if (!near || data) return;
    import("@/data/gym-map.json").then((m) => setData(m.default as unknown as MapData));
  }, [near, data]);

  // Count up from 0 when the headline enters the viewport.
  useEffect(() => {
    const el = numRef.current;
    if (!el || !headingIn) return;
    if (reduce) {
      el.textContent = fmt.format(headline);
      return;
    }
    const controls = animate(0, headline, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt.format(Math.round(v))),
    });
    return () => controls.stop();
  }, [headingIn, headline, reduce]);

  const { dots, glow, maxX } = useMemo(() => {
    if (!data) return { dots: [], glow: [], maxX: 1 };
    const filled = data.cells.filter((c) => c[2] > 0).map((c) => c[2]).sort((a, b) => a - b);
    // Only the densest ~3% of filled cells glow.
    const threshold = filled[Math.floor(filled.length * 0.97)] ?? Infinity;
    return {
      dots: data.cells,
      glow: data.cells.filter((c) => c[2] >= threshold),
      maxX: data.cells[data.cells.length - 1]?.[0] ?? 1,
    };
  }, [data]);

  // Square-root scale, capped so dense metros stay as distinct dots instead of one blob.
  const radius = (count: number) => (count === 0 ? 1.6 : Math.min(3.6, 1.6 + Math.sqrt(count) * 0.42));
  const label = `Map of the United States showing ${fmt.format(headline)}+ martial arts gyms, most concentrated in ${listOf(topStates)}.`;

  return (
    <section ref={sectionRef} id="gyms" aria-labelledby="gyms-title" className="relative px-5 py-28 sm:py-36">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 id="gyms-title" className="t-h2">
            <span className="sr-only">{fmt.format(headline)}+ gyms nationwide.</span>
            <span aria-hidden>
              <span ref={numRef} className="tabular-nums">
                {reduce ? fmt.format(headline) : "0"}
              </span>
              + gyms nationwide.
            </span>
          </h2>
          <p className="t-body mt-4 text-ash">Your gym is probably already here.</p>
        </div>

        <div ref={mapRef} className="-mx-3 mt-12 sm:mx-auto sm:mt-16 sm:w-full sm:max-w-[1040px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={label}
            className="gym-map block h-auto w-full"
            data-state={mapIn && data ? "in" : "idle"}
          >
            <defs>
              <filter id="heat" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
            </defs>

            {/* Neon heat behind the densest clusters. Drawn as one group at 35% so overlaps merge
                into a single soft heat area instead of stacking into hot spots. */}
            <g className="glow" filter="url(#heat)" opacity={0.35}>
              {glow.map(([x, y, c]) => (
                <circle key={`g${x},${y}`} cx={x} cy={y} r={Math.min(30, 12 + Math.sqrt(c) * 1.5)} fill="#beeb3b" />
              ))}
            </g>

            <g>
              {dots.map(([x, y, c]) => (
                <circle
                  key={`${x},${y}`}
                  className="dot"
                  cx={x}
                  cy={y}
                  r={radius(c)}
                  fill={c ? "var(--ink)" : "var(--line)"}
                  style={{ ["--d" as string]: `${Math.round((x / maxX) * 900 + (c ? 120 : 0))}ms` }}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
