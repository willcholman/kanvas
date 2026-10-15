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

      {/* Giant wordmark sign-off on a white-to-neon wash. */}
      <div
        aria-hidden
        className="overflow-hidden px-[3vw] pt-[8vw]"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #ccff33 100%)" }}
      >
        <Wordmark className="block h-auto w-full translate-y-[6%] text-white" title="" />
      </div>
    </footer>
  );
}
