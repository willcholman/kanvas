"use client";

import { useWaitlist, type Role } from "./WaitlistProvider";

type Variant = "light" | "dark";

const VARIANTS: Record<Variant, string> = {
  // White pill, black text (for dark backgrounds such as the hero video).
  light: "bg-white text-ink hover:bg-white/90",
  // Black pill, white text (for the white page).
  dark: "bg-ink text-white hover:bg-ink/85",
};

export function WaitlistButton({
  variant = "dark",
  role,
  className = "",
  children = "Join the waitlist",
}: {
  variant?: Variant;
  role?: Role;
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useWaitlist();
  return (
    <button
      type="button"
      onClick={() => open(role ? { role } : undefined)}
      aria-haspopup="dialog"
      className={`inline-flex h-12 items-center justify-center rounded-full px-7 text-[16px] font-medium tracking-[-0.01em] transition-[background-color,transform] duration-200 active:scale-[0.98] ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
