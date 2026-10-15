import Link from "next/link";
import { SITE } from "@/content/site";
import { Wordmark, WordmarkTm } from "./brand/Logo";

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const SOCIALS = [
  { href: SITE.instagram.url, label: "Instagram", external: true },
  { href: SITE.tiktok.url, label: "TikTok", external: true },
  { href: `mailto:${SITE.email}`, label: "Email", external: false },
];

const linkCls = "rounded-sm text-[15px] text-ink/80 transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer>
      <div className="px-5 pt-16 pb-12">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" aria-label="Kanvas home" className="inline-block rounded-md text-ink">
              <WordmarkTm className="h-6 w-auto" title="Kanvas" />
            </Link>
            <p className="mt-4 text-[13.5px] text-ash">© 2026 Kanvas</p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            <nav aria-label="Legal">
              <p className="t-label text-ash">Legal</p>
              <ul className="mt-4 space-y-2.5">
                {LEGAL.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Socials">
              <p className="t-label text-ash">Socials</p>
              <ul className="mt-4 space-y-2.5">
                {SOCIALS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className={linkCls}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {l.label}
                      {l.external && <span className="sr-only"> (opens in a new tab)</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Giant wordmark sign-off on a white-to-neon wash. It is pinned to the bottom of the screen
 * behind the page (sticky, under the z-10 page sheet), so it never moves: scrolling to the end
 * slides the white page up off it. The negative top margin tucks it under the sheet's rounded
 * corners so the wash shows through the curves.
 */
export function FooterReveal() {
  return (
    <div
      aria-hidden
      className="sticky bottom-0 z-0 -mt-[28px] overflow-hidden pt-[calc(28px+4vw)] sm:-mt-[44px] sm:pt-[calc(44px+4vw)]"
      style={{ background: "linear-gradient(180deg, #ccff33 0%, #e4ff99 45%, #ffffff 100%)" }}
    >
      <Wordmark className="block h-auto w-full text-white" title="" />
    </div>
  );
}
