import Link from "next/link";

// Same wash as the footer reveal, and a slightly deeper version of it for the numerals.
const WASH = "linear-gradient(180deg, #ccff33 0%, #e4ff99 45%, #ffffff 100%)";
const NUMERALS = "linear-gradient(180deg, #b4ea12 0%, #cdf266 45%, #edf5d6 100%)";

export default function NotFound() {
  return (
    <section className="fixed inset-0 z-[60] overflow-hidden" style={{ background: WASH }}>
      <h1 className="absolute inset-0 flex items-center justify-center">
        <span className="sr-only">Page not found</span>
        {/* Giant 404 filling the screen, cropped at the edges. */}
        <span
          aria-hidden
          className="block bg-clip-text leading-[0.8] font-semibold tracking-[-0.06em] whitespace-nowrap text-transparent select-none"
          style={{ fontSize: "max(58vw, min(82svh, 66vw))", backgroundImage: NUMERALS, backgroundSize: "100% 100svh", backgroundPosition: "center" }}
        >
          404
        </span>
      </h1>

      <div className="absolute inset-0 flex items-center justify-center px-5">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full text-[clamp(20px,2vw,28px)] font-medium tracking-[-0.02em] text-ink"
        >
          <svg aria-hidden width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1">
            <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 12H8M11.5 8.5L8 12l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover:decoration-ink">
            Take me back home.
          </span>
        </Link>
      </div>
    </section>
  );
}
