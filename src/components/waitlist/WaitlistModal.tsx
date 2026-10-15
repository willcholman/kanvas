"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { track } from "@vercel/analytics";
import { DISCIPLINE_OPTIONS, type WaitlistResponse } from "@/lib/waitlist";
import type { Role } from "./WaitlistProvider";

type Props = { open: boolean; role: Role; email: string; source: string; onClose: () => void };

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  discipline: string;
  disciplineOther: string;
  company: string; // honeypot
};

type Status = "idle" | "loading" | "created" | "exists" | "error" | "rate_limited";

const EMPTY: Fields = { firstName: "", lastName: "", email: "", discipline: "", disciplineOther: "", company: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (!f.firstName.trim()) e.firstName = "Enter your first name.";
  if (!f.email.trim()) e.email = "Enter your email.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.discipline) e.discipline = "Choose your martial art.";
  if (f.discipline === "Other" && !f.disciplineOther.trim()) e.disciplineOther = "Tell us which martial art.";
  return e;
}

function utmParams() {
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

export default function WaitlistModal({ open, role, email, source, onClose }: Props) {
  const reduce = useReducedMotion();
  // Read synchronously (this component never renders on the server) so the first open already
  // uses the right animation; switching variants mid-animation would strand the panel.
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  // Reset the form each time the modal opens fresh, carrying over an email typed elsewhere.
  useEffect(() => {
    if (open) {
      setStatus((s) => (s === "created" || s === "exists" ? "idle" : s));
      setServerErrors({});
      if (email) setFields((f) => ({ ...f, email }));
    }
  }, [open, email]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      (firstFieldRef.current ?? dialogRef.current)?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [open]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // Escape closes; Tab is trapped inside the dialog. Listens on the document so it still works
  // when focus has dropped to <body> (e.g. after the form swaps to the success state).
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (!inside) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const errors = { ...validate(fields), ...serverErrors } as Partial<Record<keyof Fields, string>>;
  const showError = (k: keyof Fields) => (submitted || touched[k]) && errors[k];

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (serverErrors[k]) setServerErrors(({ [k]: _omit, ...rest }) => rest);
  };
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const clientErrors = validate(fields);
    if (Object.keys(clientErrors).length) {
      const firstBad = Object.keys(clientErrors)[0];
      dialogRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, role, source, ...utmParams() }),
      });
      const data = (await res.json().catch(() => ({ status: "error" }))) as WaitlistResponse;
      if (data.status === "created") {
        track("waitlist_signup", { role, source });
        setStatus("created");
        setFields(EMPTY);
        setTouched({});
        setSubmitted(false);
      } else if (data.status === "exists") {
        setStatus("exists");
      } else if (data.status === "invalid") {
        setServerErrors(data.errors);
        setStatus("idle");
      } else if (data.status === "rate_limited") {
        setStatus("rate_limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const done = status === "created" || status === "exists";

  // The form unmounts on success; keep focus inside the dialog.
  useEffect(() => {
    if (done && open) doneRef.current?.focus({ preventScroll: true });
  }, [done, open]);

  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isMobile
      ? { initial: { y: "100%", opacity: 1, scale: 1 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: "100%" } }
      : {
          initial: { opacity: 0, y: 16, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 8, scale: 0.98 },
        };

  const inputCls = (bad: unknown) =>
    `h-12 w-full rounded-xl border bg-white/80 px-4 text-[16px] text-ink placeholder:text-ash/70 transition-colors focus-visible:border-ink ${
      bad ? "border-[#b42318]" : "border-line hover:border-ink/25"
    }`;
  const labelCls = "mb-1.5 block text-[14px] font-medium text-ink";
  const errCls = "mt-1.5 text-[13.5px] text-[#b42318]";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence onExitComplete={() => undefined}>
      {open && (
        <motion.div
          key="waitlist"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink/30 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="glass relative w-full max-w-[480px] overflow-y-auto overscroll-contain rounded-t-[28px] px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] [scrollbar-width:thin] sm:rounded-[28px] sm:px-8 sm:pt-8 sm:pb-7"
            // More opaque than the standard glass so the form stays easy to read over the video.
            style={{ maxHeight: "min(94svh, 760px)", background: "rgba(255,255,255,0.9)" }}
            {...panelMotion}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            tabIndex={-1}
          >
            {/* Mobile grabber */}
            <div aria-hidden className="mx-auto -mt-3 mb-4 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {done ? (
              <div className="flex flex-col items-center py-8 text-center" aria-live="polite">
                <span className="mb-6 grid size-14 place-items-center rounded-full bg-neon text-ink">
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                    />
                  </svg>
                </span>
                <h2 id={titleId} className="text-[28px] font-semibold tracking-[-0.02em]">
                  {status === "created" ? "You're on the list." : "You're already on the list."}
                </h2>
                <p id={descId} className="t-body mt-2 text-ash">
                  {status === "created"
                    ? "We'll email you when Kanvas opens."
                    : "No need to sign up again. We'll email you when Kanvas opens."}
                </p>
                <button
                  ref={doneRef}
                  type="button"
                  onClick={onClose}
                  className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[16px] font-medium text-white transition-colors hover:bg-ink/85"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="t-label text-ash">{role === "coach" ? "Coaches and gyms" : "Early access"}</p>
                <h2 id={titleId} className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[32px]">
                  Join the waitlist
                </h2>
                <p id={descId} className="t-body mt-2 text-ash">
                  Be first in when Kanvas launches on iPhone and Android.
                </p>

                <form noValidate onSubmit={onSubmit} className="mt-6 space-y-3.5">
                  <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                    <div>
                      <label htmlFor="wl-first" className={labelCls}>First name</label>
                      <input
                        ref={firstFieldRef}
                        id="wl-first"
                        name="firstName"
                        autoComplete="given-name"
                        value={fields.firstName}
                        onChange={set("firstName")}
                        onBlur={blur("firstName")}
                        aria-invalid={!!showError("firstName")}
                        aria-describedby={showError("firstName") ? "wl-first-err" : undefined}
                        className={inputCls(showError("firstName"))}
                      />
                      {showError("firstName") && <p id="wl-first-err" className={errCls}>{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="wl-last" className={labelCls}>Last name</label>
                      <input
                        id="wl-last"
                        name="lastName"
                        autoComplete="family-name"
                        value={fields.lastName}
                        onChange={set("lastName")}
                        className={inputCls(false)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="wl-email" className={labelCls}>Email</label>
                    <input
                      id="wl-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={fields.email}
                      onChange={set("email")}
                      onBlur={blur("email")}
                      aria-invalid={!!showError("email")}
                      aria-describedby={showError("email") ? "wl-email-err" : undefined}
                      className={inputCls(showError("email"))}
                    />
                    {showError("email") && <p id="wl-email-err" className={errCls}>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="wl-disc" className={labelCls}>Martial art</label>
                    <div className="relative">
                      <select
                        id="wl-disc"
                        name="discipline"
                        value={fields.discipline}
                        onChange={set("discipline")}
                        onBlur={blur("discipline")}
                        aria-invalid={!!showError("discipline")}
                        aria-describedby={showError("discipline") ? "wl-disc-err" : undefined}
                        className={`${inputCls(showError("discipline"))} appearance-none pr-10 ${fields.discipline ? "" : "text-ash"}`}
                      >
                        <option value="" disabled>
                          Choose one
                        </option>
                        {DISCIPLINE_OPTIONS.map((d) => (
                          <option key={d} value={d} className="text-ink">
                            {d}
                          </option>
                        ))}
                      </select>
                      <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink/60">
                        <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {showError("discipline") && <p id="wl-disc-err" className={errCls}>{errors.discipline}</p>}
                  </div>

                  <AnimatePresence initial={false}>
                    {fields.discipline === "Other" && (
                      <motion.div
                        key="other"
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="-m-1 overflow-hidden p-1"
                      >
                        <label htmlFor="wl-other" className={labelCls}>Which one?</label>
                        <input
                          id="wl-other"
                          name="disciplineOther"
                          value={fields.disciplineOther}
                          onChange={set("disciplineOther")}
                          onBlur={blur("disciplineOther")}
                          placeholder="e.g. Sambo, Karate, Taekwondo"
                          aria-invalid={!!showError("disciplineOther")}
                          aria-describedby={showError("disciplineOther") ? "wl-other-err" : undefined}
                          className={inputCls(showError("disciplineOther"))}
                        />
                        {showError("disciplineOther") && <p id="wl-other-err" className={errCls}>{errors.disciplineOther}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Honeypot: hidden from people and assistive tech. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="wl-company">Company</label>
                    <input id="wl-company" name="company" tabIndex={-1} autoComplete="off" value={fields.company} onChange={set("company")} />
                  </div>

                  <div aria-live="polite">
                    {status === "error" && (
                      <p className="rounded-xl bg-mist px-4 py-3 text-[14.5px] text-ink">
                        We couldn't reach the server. Check your connection and try again.
                      </p>
                    )}
                    {status === "rate_limited" && (
                      <p className="rounded-xl bg-mist px-4 py-3 text-[14.5px] text-ink">
                        Too many tries in a short time. Wait a minute, then try again.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="relative inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-[16px] font-medium text-white transition-colors hover:bg-ink/85 disabled:cursor-progress disabled:bg-ink/80"
                  >
                    {status === "loading" ? (
                      <>
                        <span aria-hidden className="mr-2.5 size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Joining
                      </>
                    ) : status === "error" ? (
                      "Try again"
                    ) : (
                      "Join the waitlist"
                    )}
                  </button>

                  <p className="text-center text-[13.5px] leading-relaxed text-ash">
                    By joining, you agree to get launch emails from Kanvas. Unsubscribe anytime.{" "}
                    <Link href="/privacy" onClick={onClose} className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
                      Privacy
                    </Link>
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
