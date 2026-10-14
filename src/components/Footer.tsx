import Link from "next/link";
import { SITE } from "@/content/site";
import { WordmarkTm } from "./brand/Logo";

const LINKS = [
  { href: "/", label: "Athletes" },
  { href: "/coaches", label: "Coaches" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-line px-5 pt-16 pb-10">
      <div className="mx-auto grid max-w-[1120px] gap-12 md:grid-cols-[1fr_auto]">
        <div>
          <Link href="/" aria-label="Kanvas home" className="inline-block rounded-md text-ink">
            <WordmarkTm className="h-7 w-auto" title="Kanvas" />
          </Link>
          <p className="t-body mt-4 max-w-[34ch] text-ash">The app for martial artists. Coming soon to iPhone and Android.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-[auto_auto]">
          <nav aria-label="Footer">
            <p className="t-label text-ash">Kanvas</p>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="rounded-sm text-[15px] text-ink/80 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="t-label text-ash">Contact</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="rounded-sm text-[15px] text-ink/80 transition-colors hover:text-ink">
                  Instagram {SITE.instagram.handle}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="rounded-sm text-[15px] break-all text-ink/80 transition-colors hover:text-ink">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-[1120px] text-[13.5px] text-ash">© 2026 Kanvas</div>
    </footer>
  );
}
