"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

export type Role = "athlete" | "coach";

type OpenOptions = { role?: Role; /** Prefills the email field, e.g. from the hero email bar. */ email?: string };

type Ctx = { open: (opts?: OpenOptions) => void };

const WaitlistContext = createContext<Ctx | null>(null);

// The modal (and its form logic) only loads once someone asks for it.
const WaitlistModal = dynamic(() => import("./WaitlistModal"), { ssr: false });

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<{ open: boolean; role: Role; email: string }>({
    open: false,
    role: "athlete",
    email: "",
  });
  const [loaded, setLoaded] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (opts?: OpenOptions) => {
      opener.current = (document.activeElement as HTMLElement) ?? null;
      // Every signup made on /coaches is a coach signup.
      const role: Role = opts?.role ?? (pathname?.startsWith("/coaches") ? "coach" : "athlete");
      setLoaded(true);
      setState({ open: true, role, email: opts?.email?.trim() ?? "" });
    },
    [pathname],
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    // Return focus to the button that opened the modal.
    requestAnimationFrame(() => opener.current?.focus?.());
  }, []);

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      {loaded && (
        <WaitlistModal open={state.open} role={state.role} email={state.email} onClose={close} source={pathname ?? "/"} />
      )}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used inside WaitlistProvider");
  return ctx;
}
