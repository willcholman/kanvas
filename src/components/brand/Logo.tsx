import { MARK, WORDMARK, WORDMARK_TM } from "./logo-data";

/** Pass title="" for a decorative logo (hidden from screen readers). */
type Props = { className?: string; title?: string };

const a11y = (title: string) => (title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const });

/** Full Kanvas wordmark. Colored with currentColor. */
export function Wordmark({ className, title = "Kanvas" }: Props) {
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} {...a11y(title)}>
      <path fill="currentColor" fillRule="evenodd" d={`${WORDMARK.k} ${WORDMARK.anvas}`} />
    </svg>
  );
}

/** Wordmark with ™, used in the footer. */
export function WordmarkTm({ className, title = "Kanvas" }: Props) {
  return (
    <svg viewBox={WORDMARK_TM.viewBox} className={className} {...a11y(title)}>
      <path fill="currentColor" fillRule="evenodd" d={WORDMARK_TM.d} />
    </svg>
  );
}

/** The K mark on its own. */
export function Mark({ className, title = "Kanvas" }: Props) {
  return (
    <svg viewBox={MARK.viewBox} className={className} {...a11y(title)}>
      <path fill="currentColor" fillRule="evenodd" d={MARK.d} />
    </svg>
  );
}
