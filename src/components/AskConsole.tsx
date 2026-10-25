import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAsk } from "../hooks/useAsk";
import { useAssistantStore } from "../stores/useAssistantStore";
import Answer from "./Answer";
import GhostMark from "./GhostMark";
import { SUGGESTIONS } from "../content/profile";
import { ArrowRight } from "./Icons";

type Phase = "typing" | "holding" | "erasing";

const TYPE_MS = 38;
const ERASE_MS = 16;
const HOLD_MS = 2600;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hero's live console. Until the visitor asks something, it types example
 * questions as a prompt (nothing is sent). A question — typed, picked from
 * the chips, or "Ask this" on the example — goes to the LLM endpoint, with the
 * ghost's "Boo!" playing while the answer loads. The demo pauses off-screen
 * and in background tabs.
 */
const AskConsole = () => {
  const reply = useAsk();
  const { ask } = reply;
  const openMenu = useAssistantStore((s) => s.openMenu);
  const reduced = useMemo(prefersReducedMotion, []);

  const [demoIndex, setDemoIndex] = useState(0);
  const [example, setExample] = useState(reduced ? (SUGGESTIONS[0] ?? "") : "");
  const [phase, setPhase] = useState<Phase>(reduced ? "holding" : "typing");
  const [draft, setDraft] = useState("");
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const asked = reply.status !== "idle";

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

  // Demo driver: type → hold → erase → next example. Stops once they ask.
  useEffect(() => {
    if (asked || reduced || !visible) return;
    const target = SUGGESTIONS[demoIndex % SUGGESTIONS.length] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      timer =
        example.length < target.length
          ? setTimeout(() => setExample(target.slice(0, example.length + 1)), TYPE_MS + Math.random() * 30)
          : setTimeout(() => setPhase("holding"), 120);
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else {
      timer =
        example.length > 0
          ? setTimeout(() => setExample(example.slice(0, -1)), ERASE_MS)
          : setTimeout(() => {
              setDemoIndex((i) => i + 1);
              setPhase("typing");
            }, 200);
    }
    return () => clearTimeout(timer);
  }, [asked, reduced, visible, phase, example, demoIndex]);

  const send = (q: string) => {
    if (!q.trim() || reply.status === "loading") return;
    setDraft("");
    void ask(q);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <div ref={rootRef} className="console" aria-label="Ask about Deepak's work">
      <div className="console-bar">
        <GhostMark className="console-ghost" />
        <span className="mono console-name">ask.alkairis</span>
        <span className="console-pill mono">AI · live</span>
      </div>

      <div className="console-body">
        <p className="console-q mono">
          <span className="console-prompt" aria-hidden="true">
            ›
          </span>
          <span>{asked ? reply.question : example}</span>
          {!asked && phase !== "holding" && <span className="caret" aria-hidden="true" />}
        </p>

        {asked ? (
          <div className="console-result" aria-live="polite">
            <Answer state={reply} onRetry={() => void ask(reply.question)} />
          </div>
        ) : (
          <div className="console-idle">
            <p>Ask anything about Deepak's work, stack or availability, and the ghost will answer.</p>
            <button
              type="button"
              className="console-try mono"
              onClick={() => send(example || SUGGESTIONS[0] || "")}
              disabled={phase !== "holding"}
            >
              Ask this <ArrowRight />
            </button>
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
          placeholder="Ask your own question…"
          autoComplete="off"
          enterKeyHint="send"
        />
        <button
          type="submit"
          className="console-send"
          aria-label="Ask"
          disabled={!draft.trim() || reply.status === "loading"}
        >
          <ArrowRight />
        </button>
      </form>

      <div className="console-suggest">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => send(s)}>
            {s}
          </button>
        ))}
        <button type="button" className="chip chip-accent" onClick={() => openMenu()}>
          Open the ghost menu
        </button>
      </div>
    </div>
  );
};

export default AskConsole;
