"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { WORDMARK } from "./brand/logo-data";
import { useWaitlist } from "./waitlist/WaitlistProvider";

const LOGO_H = 20;
const FULL_W = (LOGO_H * WORDMARK.width) / WORDMARK.height;
const K_W = (LOGO_H * WORDMARK.kWidth) / WORDMARK.height;
const TUCK_AT = 80;

const spring = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;

/** One glass pill, centered at the top: the wordmark and Join waitlist. */
export function Nav() {
  const pathname = usePathname();
  const { open } = useWaitlist();
  const reduce = useReducedMotion();
  const [tucked, setTucked] = useState(false);
  const [overHero, setOverHero] = useState(pathname === "/");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setTucked(window.scrollY > TUCK_AT);
      const hero = document.getElementById("hero");
      // Dark glass while the nav (top 16px + ~48px tall) still sits over the hero video.
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const dark = overHero;
  const transition = reduce ? { duration: 0 } : spring;

  const seg = "relative flex h-10 items-center rounded-[13px] text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300";
  // Join waitlist keeps the look of the old selected tab: a soft fill inside the glass pill.
  const join = dark ? "bg-white/[0.16] text-white hover:bg-white/[0.24]" : "bg-ink/[0.07] text-ink hover:bg-ink/[0.11]";

  return (
    <header className={`pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4 ${dark ? "on-dark" : ""}`}>
      <nav
        aria-label="Main"
        className={`pointer-events-auto flex items-center gap-1 rounded-[17px] p-1 transition-[background-color,border-color,box-shadow] duration-300 ${
          dark ? "glass-dark text-white" : "glass text-ink"
        }`}
      >
        {/* Logo: full wordmark tucks into the K mark on scroll. */}
        <Link
          href="/"
          aria-label="Kanvas home"
          onClick={(e) => {
            // Already home: glide back to the top instead of reloading the route.
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
            }
          }}
          className={`${seg} px-3.5 ${dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/[0.05]"}`}
        >
          <motion.span
            className="block overflow-hidden"
            initial={false}
            animate={{ width: tucked ? K_W : FULL_W }}
            transition={transition}
            style={{ height: LOGO_H }}
          >
            <svg viewBox={WORDMARK.viewBox} width={FULL_W} height={LOGO_H} aria-hidden className="block">
              <path fill="currentColor" fillRule="evenodd" d={WORDMARK.k} />
              <motion.path
                fill="currentColor"
                fillRule="evenodd"
                d={WORDMARK.anvas}
                initial={false}
                animate={{ opacity: tucked ? 0 : 1, x: tucked ? -120 : 0 }}
                transition={reduce ? { duration: 0 } : { ...spring, opacity: { duration: 0.18 } }}
              />
            </svg>
          </motion.span>
        </Link>

        <button type="button" onClick={() => open()} aria-haspopup="dialog" className={`${seg} px-4 active:scale-[0.98] ${join}`}>
          Join waitlist
        </button>
      </nav>
    </header>
  );
}
