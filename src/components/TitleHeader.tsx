type TitleHeaderProps = {
  /** Section heading. Rendered as an h2 — the hero owns the page's only h1. */
  title?: string;
  /** Small badge line above the heading. */
  sub?: string;
  /** Optional supporting line below the heading. */
  subtitle?: string;
};

/**
 * Section heading with a staggered reveal.
 *
 * The reveal used to be a GSAP timeline behind a ScrollTrigger, which meant
 * every section on the page registered one. It is now a CSS scroll-driven
 * animation (see src/styles/reveal.css): no JS, no trigger registry, and
 * nothing to refresh when async content changes the page height.
 */
/** Splits off the last word so it can take the --duo-2 emphasis colour. */
const splitLastWord = (text: string): [string, string] => {
  const i = text.trimEnd().lastIndexOf(" ");
  return i === -1 ? ["", text] : [text.slice(0, i + 1), text.slice(i + 1)];
};

const TitleHeader = ({ title, sub, subtitle }: TitleHeaderProps) => (
  <div className="flex flex-col items-center gap-4 reveal-stagger">
    <div className="hero-badge">
      <p>{sub}</p>
    </div>
    <div>
      {/* h2, not h1: the hero owns the page's single h1, and every section
          heading sits below it. Guarded so a caller that passes no title
          doesn't emit an empty heading. */}
      {title && (
        <h2 className="font-semibold md:text-4xl text-2xl text-center">
          {splitLastWord(title)[0]}
          <span className="th-hl">{splitLastWord(title)[1]}</span>
        </h2>
      )}
      {subtitle && (
        <p className="text-sm text-center text-gray-500 dark:text-[var(--muted)]">{subtitle}</p>
      )}
    </div>
    <div className="th-line" aria-hidden="true" />
  </div>
);

export default TitleHeader;
