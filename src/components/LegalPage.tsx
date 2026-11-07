export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="px-5 pt-36 pb-28 sm:pt-44">
      <div className="mx-auto max-w-[680px]">
        <p className="t-label text-ash">Legal</p>
        <h1 className="t-h2 mt-4">{title}</h1>
        <p className="mt-6 text-[15px] text-ash">Last updated {updated}.</p>
        <div className="mt-12 space-y-8 text-[17px] leading-[1.6] text-ink/85 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-ink [&_p]:mt-3">
          {children}
        </div>
      </div>
    </article>
  );
}
