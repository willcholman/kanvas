"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/brand/Logo";

// The kanvasfit.com/claim page (Kanvas app FUNCTIONS 2.11, B11). A claim email links to
// /claim#c=<claim>&t=<token>. The page reads the token from the fragment, then asks the claim-link
// Edge Function what to show. Opening the page changes nothing (email scanners open every
// link); only pressing a button does.
//   Inbox approval: the gym's inbox approves someone as a coach, or says it isn't someone from
//   the gym. Link confirm: a claimant confirms their own work address.
const ENDPOINT =
  process.env.NEXT_PUBLIC_CLAIM_LINK_URL ?? "https://nnuhiclnwvchakkdwrgj.supabase.co/functions/v1/claim-link";

type View = {
  kind: "inbox" | "link";
  claimant_name: string;
  gym_name: string;
  gym_city: string | null;
  gym_state: string | null;
  avatar_url: string | null;
  account_age_days: number;
  sessions_here: number;
  signs_in_as: string;
};
type Done = { status: string; gym_name: string; app_link: string; inbox: boolean };
type State =
  | { step: "loading" }
  | { step: "expired"; text: string }
  | { step: "error"; text: string }
  | { step: "view"; view: View }
  | { step: "done"; done: Done; op: "approve" | "reject" | "confirm" };

const EXPIRED = "This request is no longer open. It may have been answered, withdrawn or expired.";

async function call(body: Record<string, string>) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Read once: the hash is cleared from the address bar straight after, and React may run the
// effect twice in development.
let linkHash: string | null = null;

const age = (days: number) =>
  days === 0 ? "Kanvas account created today" : `Kanvas account created ${days} day${days === 1 ? "" : "s"} ago`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ClaimLink() {
  const [link, setLink] = useState<{ c: string; t: string } | null>(null);
  const [state, setState] = useState<State>({ step: "loading" });
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    linkHash = window.location.hash || linkHash || "";
    const params = new URLSearchParams(linkHash.slice(1));
    const c = params.get("c") ?? "";
    const t = params.get("t") ?? "";
    // Keep the token out of the address bar and history once it's read.
    window.history.replaceState(null, "", window.location.pathname);
    if (!c || !t) {
      setState({ step: "expired", text: EXPIRED });
      return;
    }
    setLink({ c, t });
    call({ c, t, op: "view" })
      .then(({ ok, status, data }) => {
        if (ok) setState({ step: "view", view: data as View });
        else if (status === 410) setState({ step: "expired", text: data.hint ?? EXPIRED });
        else setState({ step: "error", text: data.hint ?? "Try the link again in a minute." });
      })
      .catch(() => setState({ step: "error", text: "Can't reach Kanvas. Check your connection and try again." }));
  }, []);

  const act = async (op: "approve" | "reject" | "confirm") => {
    if (!link) return;
    setBusy(op);
    try {
      const { ok, status, data } = await call({ ...link, op });
      if (ok) setState({ step: "done", done: data as Done, op });
      else if (status === 410) setState({ step: "expired", text: data.hint ?? EXPIRED });
      else setState({ step: "error", text: data.hint ?? "Something went wrong. Open the link from the email again." });
    } catch {
      setState({ step: "error", text: "Can't reach Kanvas. Check your connection and try again." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section id="main" className="flex min-h-[78svh] items-center justify-center px-5 pt-28 pb-20">
      <div className="w-full max-w-[460px]">
        <Mark className="mb-8 h-10 w-auto text-ink" title="Kanvas" />
        <div className="rounded-[24px] bg-mist p-6 sm:p-8">{body()}</div>
        <p className="mt-6 text-center text-[13px] text-ash">Kanvas will never ask for your password.</p>
      </div>
    </section>
  );

  function body() {
    if (state.step === "loading") {
      return <p className="text-[15px] text-ash">Loading the request…</p>;
    }
    if (state.step === "expired") {
      return <Message title="This link has expired" text={state.text} />;
    }
    if (state.step === "error") {
      return <Message title="Something went wrong" text={state.text} />;
    }
    if (state.step === "done") {
      const { done, op } = state;
      const approved = done.status === "approved";
      if (op === "reject") {
        return (
          <Message
            title="Thanks, it's declined"
            text={`They won't be added to ${done.gym_name}. Nothing else changes. If someone asked you to approve this, it was likely a scam.`}
          />
        );
      }
      if (op === "approve") {
        return (
          <Message
            title={approved ? "Approved" : "Thanks"}
            text={
              approved
                ? `They can now manage ${done.gym_name} on Kanvas.`
                : "Kanvas will take a final look and finish this, usually within 2 days."
            }
          />
        );
      }
      return (
        <>
          <Message
            title={approved ? "Verified" : "Almost there"}
            text={
              approved
                ? `You can now manage ${done.gym_name}. Open Kanvas to get started.`
                : "Kanvas will take a final look, usually within 2 days. Check the app for updates."
            }
          />
          <a href={done.app_link} className={`${button} mt-6`}>
            Open Kanvas
          </a>
        </>
      );
    }

    const v = state.view;
    if (v.kind === "link") {
      return (
        <>
          <h1 className={title}>Confirm it&apos;s you</h1>
          <p className={text}>
            Confirm that you, {v.claimant_name}, want to verify {v.gym_name} on Kanvas with this email address.
          </p>
          <button type="button" className={`${button} mt-6`} disabled={!!busy} onClick={() => act("confirm")}>
            {busy === "confirm" ? "Confirming…" : "Confirm it's me"}
          </button>
          <p className="mt-4 text-[13px] text-ash">If you didn&apos;t ask for this, close this page. Nothing will happen.</p>
        </>
      );
    }
    return (
      <>
        <h1 className={title}>Approve {v.claimant_name}?</h1>
        <p className={text}>
          {v.claimant_name} asked to manage <strong className="font-semibold">{v.gym_name}</strong> on Kanvas as a coach.
          Coaches have full admin access: they can edit the gym&apos;s page, manage its members and make other people
          coaches.
        </p>
        <div className="mt-5 flex items-center gap-3 rounded-[16px] bg-paper p-4">
          {v.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.avatar_url} alt="" className="h-11 w-11 flex-none rounded-full object-cover" />
          ) : (
            <div className="h-11 w-11 flex-none rounded-full bg-mist" />
          )}
          <div className="min-w-0">
            <div className="font-semibold">{v.claimant_name}</div>
            <div className="text-[13px] text-ash">
              {age(v.account_age_days)} · trained at your gym on {plural(v.sessions_here, "day")}
            </div>
            <div className="truncate text-[13px] text-ash">Signs in as {v.signs_in_as}</div>
          </div>
        </div>
        <p className={`${text} mt-5 font-semibold text-ink`}>
          Only approve someone you know works at your gym. If anyone told you to expect this or asked you to approve it,
          it&apos;s a scam.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className={button} disabled={!!busy} onClick={() => act("approve")}>
            {busy === "approve" ? "Approving…" : `Approve ${v.claimant_name}`}
          </button>
          <button type="button" className={secondary} disabled={!!busy} onClick={() => act("reject")}>
            {busy === "reject" ? "Declining…" : "This isn't someone from our gym"}
          </button>
        </div>
      </>
    );
  }
}

function Message({ title: heading, text: body }: { title: string; text: string }) {
  return (
    <>
      <h1 className={title}>{heading}</h1>
      <p className={text}>{body}</p>
    </>
  );
}

const title = "text-[26px] leading-[1.15] font-semibold tracking-[-0.03em] text-ink";
const text = "mt-3 text-[15px] leading-[1.5] text-ink/70";
const button =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-[16px] font-medium text-white transition-colors hover:bg-ink/85 disabled:opacity-50";
const secondary =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-paper px-6 text-[16px] font-medium text-ink transition-colors hover:bg-paper/70 disabled:opacity-50";
