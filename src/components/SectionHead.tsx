import type { ReactNode } from "react";

type SectionHeadProps = {
  index: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
  id?: string;
};

/** Numbered mono label, a large title, and an optional note on the right. */
const SectionHead = ({ index, label, title, aside, id }: SectionHeadProps) => (
  <header className="section-head" data-fx="0.5">
    <p className="eyebrow">
      <span className="section-index">{index}</span>
      <span className="section-rule" aria-hidden="true" />
      {label}
    </p>
    <div className="section-head-row">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {aside && <div className="section-aside">{aside}</div>}
    </div>
  </header>
);

export default SectionHead;
