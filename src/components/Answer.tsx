import { tokenize } from "../lib/retrieval";
import type { SearchResult } from "../lib/retrieval";
import { ArrowUpRight, Hash } from "./Icons";

type AnswerProps = {
  result: SearchResult;
  /** Called after an in-page source link is followed (e.g. to close a menu). */
  onNavigate?: () => void;
  /** Hide the trace lines (used where space is tight). */
  compact?: boolean;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Share of the smaller passage's terms that also appear in the other. */
const overlap = (a: string, b: string) => {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  let shared = 0;
  ta.forEach((t) => {
    if (tb.has(t)) shared += 1;
  });
  return shared / Math.max(Math.min(ta.size, tb.size), 1);
};

/**
 * An extractive answer with its working shown: the query terms after
 * expansion, how many chunks matched, how long BM25 took, and numbered
 * sources the passages were lifted from.
 */
const Answer = ({ result, onNavigate, compact = false }: AnswerProps) => {
  const [top, second] = result.hits;

  if (!top) {
    return (
      <div className="answer">
        {!compact && (
          <dl className="trace mono">
            <dt>terms</dt>
            <dd>{result.terms.slice(0, 6).join(" · ") || "—"}</dd>
            <dt>bm25</dt>
            <dd>0/{result.scanned} chunks matched</dd>
          </dl>
        )}
        <p className="answer-text">
          Nothing on this site matches that yet. Try <em>RAG</em>, <em>LangGraph</em>,{" "}
          <em>certifications</em> or <em>open to roles</em> — or just ask him directly.
        </p>
      </div>
    );
  }

  // A second passage earns its place only if it's both relevant and different.
  const showSecond = second && second.score >= top.score * 0.55 && overlap(top.passage, second.passage) < 0.45;

  return (
    <div className="answer">
      {!compact && (
        <dl className="trace mono">
          <dt>terms</dt>
          <dd>{result.terms.slice(0, 6).join(" · ")}</dd>
          <dt>bm25</dt>
          <dd>
            {result.matched}/{result.scanned} chunks · {result.ms < 0.1 ? "<0.1" : result.ms.toFixed(1)} ms
          </dd>
          <dt>top-k</dt>
          <dd>
            {result.hits.length} source{result.hits.length === 1 ? "" : "s"} · score {top.score.toFixed(2)}
          </dd>
        </dl>
      )}

      <p className="answer-text">
        {top.passage}
        <sup className="cite mono">1</sup>
        {showSecond && (
          <>
            {" "}
            {second.passage}
            <sup className="cite mono">2</sup>
          </>
        )}
      </p>

      <ol className="sources">
        {result.hits.map((hit, i) => {
          const external = isExternal(hit.doc.href);
          return (
            <li key={hit.doc.id}>
              <a
                href={hit.doc.href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() => {
                  if (!external) onNavigate?.();
                }}
              >
                <span className="source-n mono">{i + 1}</span>
                <span className="source-kind mono">{hit.doc.source}</span>
                <span className="source-title">{hit.doc.title}</span>
                {external ? <ArrowUpRight className="source-icon" /> : <Hash className="source-icon" />}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Answer;
