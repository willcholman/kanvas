"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background video, mounted only after hydration and only when the visitor has not asked for
 * reduced motion. The poster image underneath is the LCP element and the fallback.
 */
export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // Autoplay blocked (e.g. Low Power Mode). The poster stays visible.
    });
  }, [enabled]);

  if (!enabled) return null;

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      // No poster attribute: the optimized next/image poster sits directly underneath and the
      // video only fades in once it is actually playing.
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    >
      <source src="/video/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src="/video/hero-1080.webm" type="video/webm" />
      <source src="/video/hero-1080.mp4" type="video/mp4" />
    </video>
  );
}
