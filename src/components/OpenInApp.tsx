import { Mark } from "@/components/brand/Logo";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";

/**
 * Landing page for app links (/s, /u, /gyms, /groups) opened without the app installed. With the
 * app, iOS and Android open these links in Kanvas and this page never shows. "Open in Kanvas"
 * tries the app's own scheme for anyone who has it but landed here anyway (an in-app browser,
 * say). Store links replace the waitlist once Kanvas is in the App Store and Google Play.
 */
export function OpenInApp({ title, appPath }: { title: string; appPath: string }) {
  return (
    <section id="main" className="flex min-h-[78svh] items-center justify-center px-5 pt-28 pb-20">
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        <Mark className="h-14 w-auto text-ink" title="" />
        <h1 className="mt-8 text-[clamp(30px,5vw,40px)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink">{title}</h1>
        <p className="mt-4 text-[17px] leading-[1.5] text-ink/60">
          Kanvas is the app for martial artists. If you have it, this opens right in the app.
        </p>
        <div className="mt-9 flex w-full flex-col gap-3">
          <a
            href={`kanvas://${appPath}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-[16px] font-medium text-white transition-colors hover:bg-ink/85"
          >
            Open in Kanvas
          </a>
          <WaitlistButton variant="quiet" className="w-full">
            Don&apos;t have it yet? Join the waitlist
          </WaitlistButton>
        </div>
      </div>
    </section>
  );
}

/** App links carry a uuid; anything else is a 404. */
export const isId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
