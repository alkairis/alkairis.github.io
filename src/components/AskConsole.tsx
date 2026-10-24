import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { useAssistantStore } from "../stores/useAssistantStore";
import Answer from "./Answer";
import GhostMark from "./GhostMark";
import { SUGGESTIONS } from "../content/profile";
import { ArrowRight } from "./Icons";


type Phase = "typing" | "searching" | "done";

const TYPE_MS = 34;
const SEARCH_MS = 520;
const HOLD_MS = 7000;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hero's live demo. It types a recruiter-style question, runs it through
 * the same BM25 index the ghost uses, and shows the trace and cited answer.
 * It cycles through a few questions until the visitor asks their own, and
 * pauses whenever it's scrolled out of view or the tab is hidden.
 */
const AskConsole = () => {
  const index = useSearchIndex();
  const openMenu = useAssistantStore((s) => s.openMenu);
  const reduced = useMemo(prefersReducedMotion, []);

  const [demoIndex, setDemoIndex] = useState(0);
  const [query, setQuery] = useState(reduced ? (SUGGESTIONS[0] ?? "") : "");
  const [phase, setPhase] = useState<Phase>(reduced ? "done" : "typing");
  const [interactive, setInteractive] = useState(reduced);
  const [draft, setDraft] = useState("");
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Pause the demo off-screen or in a background tab.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      threshold: 0.2,
    });
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Demo driver: type → search → hold → next question.
  useEffect(() => {
    if (interactive || !visible) return;
    const target = SUGGESTIONS[demoIndex % SUGGESTIONS.length] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (query.length < target.length) {
        timer = setTimeout(() => setQuery(target.slice(0, query.length + 1)), TYPE_MS + Math.random() * 30);
      } else {
        timer = setTimeout(() => setPhase("searching"), 260);
      }
    } else if (phase === "searching") {
      timer = setTimeout(() => setPhase("done"), SEARCH_MS);
    } else {
      timer = setTimeout(() => {
        setDemoIndex((i) => i + 1);
        setQuery("");
        setPhase("typing");
      }, HOLD_MS);
    }
    return () => clearTimeout(timer);
  }, [interactive, visible, phase, query, demoIndex]);

  const result = useMemo(() => (phase === "done" && query ? index.search(query, 3) : null), [phase, query, index]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setInteractive(true);
    setQuery(text);
    setDraft("");
    setPhase(reduced ? "done" : "searching");
  };

  // Searching is near-instant; the short beat just makes the step legible.
  useEffect(() => {
    if (!interactive || phase !== "searching") return;
    const t = setTimeout(() => setPhase("done"), 280);
    return () => clearTimeout(t);
  }, [interactive, phase]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div ref={rootRef} className="console" aria-label="Ask about Deepak's work">
      <div className="console-bar">
        <GhostMark className="console-ghost" />
        <span className="mono console-name">ask.alkairis</span>
        <span className="console-pill mono" title="Okapi BM25 over this site's content, computed in your browser">
          BM25 · runs locally
        </span>
      </div>

      <div className="console-body" aria-live="polite">
        <p className="console-q mono">
          <span className="console-prompt" aria-hidden="true">
            ›
          </span>
          <span>{query}</span>
          {phase === "typing" && <span className="caret" aria-hidden="true" />}
        </p>

        {phase === "searching" && (
          <p className="console-wait mono">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            retrieving from {index.size} chunks
          </p>
        )}

        {result && (
          <div className="console-result" key={result.query}>
            <Answer result={result} />
          </div>
        )}
      </div>

      <form className="console-input" onSubmit={onSubmit}>
        <label htmlFor="console-ask" className="sr-only">
          Ask a question about Deepak's work
        </label>
        <input
          id="console-ask"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setInteractive(true)}
          placeholder="Ask your own question…"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit" className="console-send" aria-label="Ask" disabled={!draft.trim()}>
          <ArrowRight />
        </button>
      </form>

      <div className="console-suggest">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
        <button type="button" className="chip chip-accent" onClick={() => openMenu(query)}>
          Open the ghost menu
        </button>
      </div>
    </div>
  );
};

export default AskConsole;
