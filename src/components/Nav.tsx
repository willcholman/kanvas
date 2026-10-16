"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { WORDMARK } from "./brand/logo-data";
import { useWaitlist } from "./waitlist/WaitlistProvider";

const LOGO_H = 20;
const FULL_W = (LOGO_H * WORDMARK.width) / WORDMARK.height;
const K_W = (LOGO_H * WORDMARK.kWidth) / WORDMARK.height;
const TUCK_AT = 80;

const LINKS = [
  { href: "/", label: "Athletes" },
  { href: "/coaches", label: "Coaches" },
] as const;

const spring = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;

export function Nav() {
  const pathname = usePathname();
  const { open } = useWaitlist();
  const reduce = useReducedMotion();
  const [tucked, setTucked] = useState(false);
  const [overHero, setOverHero] = useState(pathname === "/");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !menuBtnRef.current?.contains(t)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  const dark = overHero;
  const transition = reduce ? { duration: 0 } : spring;

  const seg = "relative flex h-10 items-center rounded-[13px] text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300";
  const segIdle = dark ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink/75 hover:bg-ink/[0.05] hover:text-ink";
  const segActive = dark ? "bg-white/[0.16] text-white" : "bg-ink/[0.07] text-ink";

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

        {/* Desktop and tablet links */}
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`${seg} hidden px-4 sm:flex ${active ? segActive : segIdle}`}
            >
              {l.label}
            </Link>
          );
        })}

        {/* Mobile menu toggle */}
        <button
          ref={menuBtnRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className={`${seg} w-10 justify-center sm:hidden ${segIdle}`}
        >
          <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden className="shrink-0">
            <motion.path
              d="M3 6.5h12"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              animate={menuOpen ? { d: "M4 4l10 10" } : { d: "M3 6.5h12" }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            />
            <motion.path
              d="M3 11.5h12"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              animate={menuOpen ? { d: "M4 14L14 4" } : { d: "M3 11.5h12" }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            />
          </svg>
        </button>

      </nav>

      {/* Join waitlist sits in its own pill in the top-right corner, level with the main nav. */}
      <div
        className={`pointer-events-auto absolute top-0 right-4 rounded-[17px] p-1 transition-[background-color,border-color,box-shadow] duration-300 sm:right-6 ${
          dark ? "glass-dark" : "glass"
        }`}
      >
        <button
          type="button"
          onClick={() => open()}
          aria-haspopup="dialog"
          className={`flex h-10 items-center rounded-[13px] px-4 text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300 ${
            dark ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-ink/85"
          }`}
        >
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">Join waitlist</span>
        </button>
      </div>

      {/* Mobile glass sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto mt-2 w-[min(100%,320px)] origin-top rounded-[20px] p-2 sm:hidden ${
              dark ? "glass-dark text-white" : "glass text-ink"
            }`}
          >
            <ul>
              {LINKS.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-12 items-center rounded-[14px] px-4 text-[17px] font-medium tracking-[-0.01em] ${active ? segActive : segIdle}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
