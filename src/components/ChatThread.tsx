import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Turn } from "../stores/useChatStore";
import Answer from "./Answer";

type ChatThreadProps = {
  turns: Turn[];
  /** The scrolling element the thread lives in; it follows the latest turn. */
  scrollRef: RefObject<HTMLElement | null>;
  onRetry: (id: string) => void;
  onNavigate?: (() => void) | undefined;
};

const PAD = 8;

/**
 * The conversation so far: each question as a bubble, its answer (or the
 * "Boo!" while it loads) underneath. When a question is asked or answered,
 * the scroll container brings that turn's top into view so the answer reads
 * from its first line; on mount it jumps straight to the latest turn.
 */
const ChatThread = ({ turns, scrollRef, onRetry, onNavigate }: ChatThreadProps) => {
  const lastRef = useRef<HTMLLIElement | null>(null);
  const mounted = useRef(false);
  const last = turns[turns.length - 1];

  useEffect(() => {
    const box = scrollRef.current;
    const el = lastRef.current;
    if (!box || !el) return;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - PAD;
    const smooth = mounted.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: Math.max(top, 0), behavior: smooth ? "smooth" : "auto" });
    mounted.current = true;
  }, [scrollRef, last?.id, last?.status]);

  return (
    <ol className="chat-thread" aria-label="Conversation">
      {turns.map((turn, i) => (
        <li key={turn.id} ref={i === turns.length - 1 ? lastRef : undefined} className="chat-turn">
          <p className="chat-q">{turn.question}</p>
          <div className="chat-a" aria-live={i === turns.length - 1 ? "polite" : undefined}>
            <Answer turn={turn} onRetry={() => onRetry(turn.id)} onNavigate={onNavigate} />
          </div>
        </li>
      ))}
    </ol>
  );
};

export default ChatThread;
