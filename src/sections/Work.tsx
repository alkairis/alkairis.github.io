import { useState } from "react";
import Diagram from "../components/Diagram";
import SectionHead from "../components/SectionHead";
import { ArrowDown, ArrowUpRight } from "../components/Icons";
import { caseStudies } from "../content/caseStudies";
import type { CaseStudy } from "../content/caseStudies";
import { tone } from "../lib/style";

const CaseStudyCard = ({ cs, n }: { cs: CaseStudy; n: number }) => {
  const [open, setOpen] = useState(false);
  const moreId = `case-${cs.slug}-more`;

  return (
    <article id={`case-${cs.slug}`} className={`case${open ? " is-open" : ""}`} style={tone(cs.accent)} data-reveal>
      <div className="case-grid">
        <div className="case-copy">
          <p className="case-meta mono">
            <span className="case-n">{String(n).padStart(2, "0")}</span>
            <span>{cs.client}</span>
            <span className="case-dot" aria-hidden="true" />
            <span>{cs.period}</span>
          </p>
          <h3 className="case-title">{cs.title}</h3>
          <p className="case-role">{cs.role}</p>
          <p className="case-summary">{cs.summary}</p>

          <ul className="case-bullets">
            {cs.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <div className="chips">
            {cs.chips.map((c) => (
              <span key={c} className="chip chip-accent">
                {c}
              </span>
            ))}
          </div>

          {cs.metrics.length > 0 && (
            <dl className="case-metrics">
              {cs.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.value}</dt>
                  <dd>{m.label}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="case-actions">
            <button
              type="button"
              className="link-u case-toggle"
              aria-expanded={open}
              aria-controls={moreId}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Hide the approach" : "How I approach it"}
              <ArrowDown className="case-toggle-icon" />
            </button>
            {cs.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-u arrow-link">
                {l.label}
                <ArrowUpRight />
              </a>
            ))}
          </div>
        </div>

        <figure className="case-figure">
          <div className="diagram-scroll" tabIndex={0} aria-label={`Architecture diagram: ${cs.diagramCaption}`}>
            <Diagram kind={cs.diagram} title={cs.diagramCaption} />
          </div>
          <figcaption className="mono">
            {cs.diagramCaption}
            <span className="swipe-hint" aria-hidden="true">
              {" "}
              · swipe to see all →
            </span>
          </figcaption>
        </figure>
      </div>

      <div id={moreId} className="case-more" hidden={!open}>
        <ol className="decisions">
          {cs.decisions.map((d, i) => (
            <li key={d.title}>
              <span className="decision-n mono">{String(i + 1).padStart(2, "0")}</span>
              <h4>{d.title}</h4>
              <p>{d.body}</p>
            </li>
          ))}
        </ol>
        <div className="case-stack">
          <p className="eyebrow">Stack</p>
          <div className="chips">
            {cs.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

const Work = () => (
  <section id="work" className="section" aria-labelledby="work-title">
    <div className="container">
      <SectionHead
        index="01"
        label="Selected work"
        id="work-title"
        title={
          <>
            Systems I've <span className="serif">shipped</span>
          </>
        }
        aside={<p>Architecture first. For backend and AI work, the diagram is the screenshot.</p>}
      />
      <div className="cases">
        {caseStudies.map((cs, i) => (
          <CaseStudyCard key={cs.slug} cs={cs} n={i + 1} />
        ))}
      </div>
    </div>
  </section>
);

export default Work;
