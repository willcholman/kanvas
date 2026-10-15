"use client";

import { useState } from "react";
import { useWaitlist } from "../waitlist/WaitlistProvider";

/** Glass email bar at the foot of the hero. "Get started" opens the waitlist with the email filled in. */
export function HeroEmailBar() {
  const { open } = useWaitlist();
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        open({ email });
      }}
      className="glass-dark flex w-[min(100%,420px)] items-center gap-1 rounded-[17px] p-1"
    >
      <label htmlFor="hero-email" className="sr-only">
        Your email
      </label>
      <input
        id="hero-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 min-w-0 flex-1 rounded-[13px] bg-transparent px-4 text-[15px] text-white placeholder:text-white/65 focus-visible:bg-white/10"
      />
      <button
        type="submit"
        aria-haspopup="dialog"
        className="h-10 shrink-0 rounded-[13px] bg-white px-4 text-[15px] font-medium tracking-[-0.01em] text-ink transition-colors hover:bg-white/90"
      >
        Get started
      </button>
    </form>
  );
}
