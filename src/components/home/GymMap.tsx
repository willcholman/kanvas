"use client";

import { useEffect, useRef, useState } from "react";
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

const INK = "#0a0a0a";
const GRID = "#e2e2df";
const NEON = "204, 255, 51"; // #ccff33

// Hover lens, in map units (the map is 1000 wide). A magnifying glass: dots under the pointer
// grow in place and their neighbours spread outward to make room.
const LENS_RADIUS = 90;
const LENS_POWER = 0.62; // < 1 spreads the middle of the lens apart
const LENS_GROW_GYM = 1.7;
const LENS_GROW_GRID = 1.2;

const fmt = new Intl.NumberFormat("en-US");

function listOf(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Square-root scale, capped so dense metros stay as distinct dots instead of one blob.
const baseRadius = (count: number) => (count === 0 ? 1.6 : Math.min(3.6, 1.6 + Math.sqrt(count) * 0.42));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function GymMap({ headline, topStates }: { headline: number; topStates: string[] }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const near = useInView(rootRef, { once: true, margin: "800px 0px" });
  const headingIn = useInView(numRef, { once: true, margin: "0px 0px -15% 0px" });
  const mapIn = useInView(boxRef, { once: true, margin: "0px 0px -20% 0px" });
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

  // Canvas renderer: one element instead of thousands of SVG nodes, and it only redraws while
  // something is moving (the entrance or the hover lens).
  const engine = useRef<{ play: () => void } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!data || !canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = data.cells.length;
    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    const rs = new Float32Array(n);
    const gym = new Uint8Array(n);
    const delay = new Float32Array(n);
    const scale = new Float32Array(n).fill(1);
    const offX = new Float32Array(n);
    const offY = new Float32Array(n);
    const maxX = data.cells[n - 1]?.[0] ?? W;
    data.cells.forEach(([x, y, c], i) => {
      xs[i] = x;
      ys[i] = y;
      rs[i] = baseRadius(c);
      gym[i] = c > 0 ? 1 : 0;
      delay[i] = (x / maxX) * 900 + (c ? 120 : 0);
    });

    // Only the densest ~3% of filled cells glow.
    const filled = data.cells.filter((c) => c[2] > 0).map((c) => c[2]).sort((a, b) => a - b);
    const threshold = filled[Math.floor(filled.length * 0.97)] ?? Infinity;
    const glowCells = data.cells.filter((c) => c[2] >= threshold);

    let k = 1; // CSS px per map unit
    let dpr = 1;
    let glow: HTMLCanvasElement | null = null;
    const pointer = { x: 0, y: 0, active: false };
    let entranceStart = reduce ? -Infinity : Number.NaN; // NaN = waiting to play
    let raf = 0;

    const renderGlow = () => {
      glow = document.createElement("canvas");
      glow.width = canvas.width;
      glow.height = canvas.height;
      const g = glow.getContext("2d")!;
      g.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      g.globalCompositeOperation = "lighten";
      for (const [x, y, c] of glowCells) {
        const r = Math.min(30, 12 + Math.sqrt(c) * 1.5) + 34;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${NEON}, 1)`);
        grad.addColorStop(0.45, `rgba(${NEON}, 0.55)`);
        grad.addColorStop(1, `rgba(${NEON}, 0)`);
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };

    const resize = () => {
      const w = box.clientWidth;
      if (!w) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      k = w / W;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * (H / W) * dpr);
      renderGlow();
      kick();
    };

    const frame = (now: number) => {
      raf = 0;
      let moving = false;
      const waiting = Number.isNaN(entranceStart);
      const elapsed = waiting ? 0 : now - entranceStart;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Glow fades up after the dots.
      const glowA = waiting ? 0 : Math.min(1, Math.max(0, (elapsed - 1000) / 1400));
      if (glowA < 1 && !waiting) moving = true;
      if (glow && glowA > 0) {
        ctx.globalAlpha = 0.42 * glowA;
        ctx.drawImage(glow, 0, 0);
        ctx.globalAlpha = 1;
      }

      ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      const ease = reduce ? 1 : 0.2;

      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if (gym[i] !== pass) continue;

          // Hover lens: grow near the pointer and push neighbours outward.
          let ts = 1, tx = 0, ty = 0;
          if (pointer.active) {
            const dx = xs[i] - pointer.x;
            const dy = ys[i] - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < LENS_RADIUS) {
              const u = d / LENS_RADIUS;
              const t = 1 - u;
              const e = t * t * (3 - 2 * t);
              ts = 1 + e * (gym[i] ? LENS_GROW_GYM : LENS_GROW_GRID);
              if (d > 0.001) {
                const push = LENS_RADIUS * (Math.pow(u, LENS_POWER) - u);
                tx = (dx / d) * push;
                ty = (dy / d) * push;
              }
            }
          }
          scale[i] += (ts - scale[i]) * ease;
          offX[i] += (tx - offX[i]) * ease;
          offY[i] += (ty - offY[i]) * ease;
          if (Math.abs(ts - scale[i]) > 0.005 || Math.abs(tx - offX[i]) > 0.05 || Math.abs(ty - offY[i]) > 0.05) moving = true;

          let enter = 1;
          if (waiting) enter = 0;
          else if (elapsed < delay[i] + 520) {
            enter = easeOut(Math.max(0, (elapsed - delay[i]) / 520));
            moving = true;
          }
          const r = rs[i] * scale[i] * enter;
          if (r <= 0.05) continue;
          const x = xs[i] + offX[i];
          const y = ys[i] + offY[i];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = pass ? INK : GRID;
        ctx.fill();
      }

      if (moving) kick();
    };

    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    engine.current = {
      play: () => {
        if (Number.isNaN(entranceStart)) entranceStart = performance.now();
        kick();
      },
    };

    const toMap = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / k;
      pointer.y = (e.clientY - rect.top) / k;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // let touch scroll the page
      toMap(e);
      pointer.active = true;
      kick();
    };
    const onLeave = () => {
      pointer.active = false;
      kick();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      engine.current = null;
    };
  }, [data, reduce]);

  useEffect(() => {
    if (mapIn && data) engine.current?.play();
  }, [mapIn, data]);

  const label = `Map of the United States showing ${fmt.format(headline)}+ martial arts gyms, most concentrated in ${listOf(topStates)}.`;

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center">
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
        <p className="t-body mt-3 text-ash">Your gym is probably already here.</p>
      </div>

      {/* Sized by both width and height so the whole map fits on screen while it is pinned. */}
      <div
        ref={boxRef}
        className="mt-8 w-[min(100%,1040px,calc((100svh-230px)*1.613))] sm:mt-10"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full" />
      </div>
    </div>
  );
}
