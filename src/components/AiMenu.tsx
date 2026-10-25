import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAssistantStore } from "../stores/useAssistantStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useAsk } from "../hooks/useAsk";
import { useSiteData } from "../hooks/useSiteData";
import { useScrollLock } from "../hooks/useScrollLock";
import Answer from "./Answer";
import GhostMark from "./GhostMark";
import { SUGGESTIONS } from "../content/profile";
import { ArrowUpRight, Close, Copy, Corner, Download, Hash, Moon, Search, Sparkle, Sun } from "./Icons";

type Item = {
  id: string;
  group: "Question" | "Ask" | "Go to" | "Actions" | "Elsewhere";
  label: string;
  keywords: string;
  icon: ReactNode;
  run: () => void;
};

const SECTIONS = [
  { hash: "work", label: "Selected work", keywords: "case studies projects rag agents" },
  { hash: "about", label: "About", keywords: "bio profile photo" },
  { hash: "experience", label: "Experience", keywords: "roles jobs education timeline" },
  { hash: "toolbox", label: "Toolbox", keywords: "skills stack tools" },
  { hash: "credentials", label: "Certifications & awards", keywords: "certificates recognition" },
  { hash: "writing", label: "Writing", keywords: "blog medium posts articles" },
  { hash: "contact", label: "Contact", keywords: "email hire reach" },
];

const GROUP_LABEL: Record<Item["group"], string> = {
  Question: "Ask the ghost",
  Ask: "Try asking",
  "Go to": "Go to",
  Actions: "Actions",
  Elsewhere: "Elsewhere",
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The ghost's AI menu (also ⌘K / Ctrl+K, or "/"). Submitting a question sends
 * it to the LLM endpoint and shows the answer (with a "Boo!" while it loads);
 * typing also filters navigation and actions, so it doubles as a command
 * palette. Arrow keys move, Enter runs — and with text typed, the first row
 * is "Ask the ghost".
 */
const AiMenu = () => {
  const { open, seed, openMenu, toggleMenu } = useAssistantStore();

  useScrollLock(open);

  // Global shortcuts: ⌘K / Ctrl+K toggles; "/" opens unless you're typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleMenu();
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        openMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openMenu, toggleMenu]);

  // Mounted only while open, so every open starts fresh (query, selection,
  // answer) and closing cancels any question in flight.
  return open ? <AiPanel seed={seed} /> : null;
};

const AiPanel = ({ seed }: { seed: string }) => {
  const closeMenu = useAssistantStore((s) => s.closeMenu);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);
  const reply = useAsk();
  const { ask } = reply;
  const { email, resumeUrl, links } = useSiteData();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState(seed);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Focus the input on open; hand focus back to where it was on close.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      previous?.focus?.();
    };
  }, []);

  // A new question starts at the top of the list, where its answer appears.
  useEffect(() => {
    if (reply.question) scrollRef.current?.scrollTo({ top: 0 });
  }, [reply.question]);

  const changeQuery = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const submit = useCallback(
    (question: string) => {
      if (!question.trim()) return;
      void ask(question);
      setQuery("");
      setActive(0);
    },
    [ask]
  );

  const goTo = useCallback(
    (hash: string) => {
      closeMenu();
      if (location.pathname !== "/") {
        navigate(`/#${hash}`);
        return;
      }
      // Let the menu unmount and the scroll lock release before scrolling.
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${hash}`);
      });
    },
    [closeMenu, location.pathname, navigate]
  );

  const copyEmail = useCallback(async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email.display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = email.href;
    }
  }, [email]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];

    SECTIONS.forEach((s) =>
      list.push({
        id: `go-${s.hash}`,
        group: "Go to",
        label: s.label,
        keywords: `${s.label} ${s.keywords} go section`,
        icon: <Hash />,
        run: () => goTo(s.hash),
      })
    );

    list.push({
      id: "resume",
      group: "Actions",
      label: "Open the resume page",
      keywords: "resume cv print pdf",
      icon: <Corner />,
      run: () => {
        closeMenu();
        navigate("/resume");
      },
    });

    if (resumeUrl) {
      list.push({
        id: "resume-pdf",
        group: "Actions",
        label: "Download resume (PDF)",
        keywords: "resume cv pdf download",
        icon: <Download />,
        run: () => {
          closeMenu();
          window.open(resumeUrl, "_blank", "noopener");
        },
      });
    }

    if (email) {
      list.push({
        id: "copy-email",
        group: "Actions",
        label: copied ? `Copied ${email.display}` : `Copy email — ${email.display}`,
        keywords: "copy email contact mail hire",
        icon: <Copy />,
        run: () => void copyEmail(),
      });
    }

    list.push({
      id: "theme",
      group: "Actions",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      keywords: "theme dark light mode toggle",
      icon: theme === "dark" ? <Sun /> : <Moon />,
      run: toggleTheme,
    });

    links.forEach((l) =>
      list.push({
        id: `link-${l.id}`,
        group: "Elsewhere",
        label: l.label,
        keywords: `${l.label} ${l.display} profile social`,
        icon: <FontAwesomeIcon icon={l.icon} />,
        run: () => {
          window.open(l.href, "_blank", "noopener");
        },
      })
    );

    return list;
  }, [goTo, closeMenu, navigate, resumeUrl, email, copied, copyEmail, theme, toggleTheme, links]);

  const q = query.trim().toLowerCase();

  const visible: Item[] = useMemo(() => {
    if (!q) {
      const asks: Item[] = SUGGESTIONS.map((s, i) => ({
        id: `ask-${i}`,
        group: "Ask",
        label: s,
        keywords: s,
        icon: <Sparkle />,
        run: () => submit(s),
      }));
      return [...asks, ...items];
    }
    const question: Item = {
      id: "ask-query",
      group: "Question",
      label: `Ask “${query.trim()}”`,
      keywords: query,
      icon: <Sparkle />,
      run: () => submit(query),
    };
    const words = q.split(/\s+/);
    return [question, ...items.filter((item) => words.every((w) => `${item.label} ${item.keywords}`.toLowerCase().includes(w)))];
  }, [q, query, items, submit]);

  const activeIndex = Math.min(active, Math.max(visible.length - 1, 0));

  useEffect(() => {
    panelRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = visible.length;
      if (!n) return;
      setActive((activeIndex + (e.key === "ArrowDown" ? 1 : -1) + n) % n);
      return;
    }
    if (e.key === "Enter" && e.target === inputRef.current) {
      const item = visible[activeIndex];
      if (item) {
        e.preventDefault();
        item.run();
      }
      return;
    }
    if (e.key === "Tab") {
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = nodes?.[0];
      const last = nodes?.[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  let lastGroup = "";

  return (
    <div className="ai-layer" onKeyDown={onKeyDown}>
      <div className="ai-backdrop" onClick={closeMenu} aria-hidden="true" />
      <div
        ref={panelRef}
        id="ai-menu"
        className="ai-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Ask about Deepak"
      >
        <div className="ai-head">
          <GhostMark className="ai-ghost" />
          <div>
            <p className="ai-title">Ask about Deepak</p>
            <p className="ai-sub mono">AI answers about his work and experience</p>
          </div>
          <button type="button" className="icon-btn" onClick={closeMenu} aria-label="Close">
            <Close />
          </button>
        </div>

        <div className="ai-search">
          <Search className="ai-search-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Ask anything, or jump somewhere…"
            aria-label="Ask a question or search actions"
            aria-controls="ai-list"
            aria-activedescendant={visible[activeIndex] ? `ai-item-${visible[activeIndex].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <kbd className="mono">esc</kbd>
        </div>

        <div ref={scrollRef} className="ai-scroll">
          {reply.status !== "idle" && (
            <section className="ai-answer" aria-live="polite" aria-label="Answer">
              <p className="ai-question">{reply.question}</p>
              <Answer state={reply} onRetry={() => void ask(reply.question)} onNavigate={closeMenu} />
            </section>
          )}

          <ul id="ai-list" role="listbox" aria-label="Suggestions and actions" className="ai-list">
            {visible.map((item, i) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              return (
                <li key={item.id} role="presentation">
                  {header && (
                    <p className="ai-group eyebrow" role="presentation">
                      {GROUP_LABEL[header]}
                    </p>
                  )}
                  <div
                    id={`ai-item-${item.id}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    data-index={i}
                    className={`ai-item${i === activeIndex ? " is-active" : ""}`}
                    onMouseMove={() => setActive(i)}
                    onClick={item.run}
                  >
                    <span className="ai-item-icon">{item.icon}</span>
                    <span className="ai-item-label">{item.label}</span>
                    {item.group === "Elsewhere" ? (
                      <ArrowUpRight className="ai-item-go" />
                    ) : (
                      <span className="ai-item-enter mono" aria-hidden="true">
                        ↵
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
            {!visible.length && <li className="ai-empty">Nothing matches — try “RAG”, “LangGraph” or “contact”.</li>}
          </ul>
        </div>

        <div className="ai-foot mono">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiMenu;
