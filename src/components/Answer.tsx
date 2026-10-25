import type { ReactNode } from "react";
import type { Turn } from "../stores/useChatStore";
import BooLoader from "./BooLoader";

type AnswerProps = {
  turn: Turn;
  onRetry: () => void;
  /** Called after an in-page link is followed (e.g. to close a menu). */
  onNavigate?: (() => void) | undefined;
};

const SAFE_HREF = /^(https?:|mailto:|#|\/)/;
const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);

// **bold**, `code`, [label](href), *italic* — the markdown LLMs reach for most.
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const LIST_ITEM = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

const inline = (text: string, onNavigate?: () => void): ReactNode[] =>
  text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = LINK.exec(part);
    if (link) {
      const [, label = "", href = ""] = link;
      if (!SAFE_HREF.test(href)) return label;
      return isExternal(href) ? (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="link-u">
          {label}
        </a>
      ) : (
        <a key={i} href={href} className="link-u" onClick={onNavigate}>
          {label}
        </a>
      );
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });

/**
 * Renders an LLM reply as React nodes (never as HTML): paragraphs, bullet and
 * numbered lists, headings, and the inline bits above. Anything else is text.
 */
const RichText = ({ text, onNavigate }: { text: string; onNavigate?: (() => void) | undefined }) => {
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join(" "), onNavigate)}</p>);
    para = [];
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{inline(item, onNavigate)}</li>);
      blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    }
    list = null;
  };

  for (const line of text.replace(/\r/g, "").split("\n")) {
    const item = LIST_ITEM.exec(line);
    const heading = HEADING.exec(line);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (item) {
      flushPara();
      const ordered = Boolean(item[1]);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item[2] ?? "");
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <p key={blocks.length} className="answer-heading">
          {inline(heading[1] ?? "", onNavigate)}
        </p>,
      );
    } else if (list && /^\s{2,}/.test(line)) {
      // An indented continuation of the previous list item.
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return <div className="answer-text">{blocks}</div>;
};

const ERROR_COPY: Record<string, string> = {
  unconfigured: "The ghost's answering service isn't connected yet.",
  timeout: "The ghost took too long to answer.",
};

/**
 * The ghost's reply: the "Boo!" preloader while the LLM works, then the answer,
 * or a friendly error with a retry and a way to reach Deepak directly.
 */
const Answer = ({ turn, onRetry, onNavigate }: AnswerProps) => {
  if (turn.status === "loading") return <BooLoader />;

  if (turn.status === "error") {
    const unconfigured = turn.errorKind === "unconfigured";
    const lead = ERROR_COPY[turn.errorKind ?? ""] ?? "The ghost couldn't reach its brain just now.";
    return (
      <div className="answer answer--error">
        <div className="answer-text">
          <p>
            {lead} {unconfigured ? "Meanwhile, you can" : "Try again in a moment, or"}{" "}
            <a href="#contact" className="link-u" onClick={onNavigate}>
              reach Deepak directly
            </a>
            .
          </p>
        </div>
        {!unconfigured && (
          <button type="button" className="chip chip-accent answer-retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="answer">
      <RichText text={turn.answer} onNavigate={onNavigate} />
    </div>
  );
};

export default Answer;
