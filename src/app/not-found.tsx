import Link from "next/link";
import { Blobs } from "@/components/Blobs";
import { Mark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center">
      <Blobs preset="cta" />
      <div className="flex flex-col items-center">
        <Mark className="h-12 w-auto text-ink" title="" />
        <p className="t-label mt-8 text-ash">Error 404</p>
        <h1 className="t-h2 mt-4 max-w-[16ch]">This page tapped out.</h1>
        <p className="t-body mt-4 max-w-[40ch] text-ash">The link may be old, or the page moved. Head back home to keep training.</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[16px] font-medium text-white transition-colors hover:bg-ink/85"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
