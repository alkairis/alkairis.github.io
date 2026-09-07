import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faXmark,
  faPaperPlane,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";

type ChatRole = "user" | "bot";

type ChatMessage = {
  role: ChatRole;
  id: number;
  text: string;
};

/** The reply shapes the backend may use; first non-empty one wins. */
type ChatResponse = {
  reply?: string;
  message?: string;
  answer?: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "bot",
  id: 0,
  text: "Hi! I'm Alkairis' AI assistant. Ask me anything about his experience, skills, projects, or availability.",
};

const SUGGESTIONS = [
  "What's your experience?",
  "What tech do you work with?",
  "Are you open to opportunities?",
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", id: Date.now(), text: trimmed },
    ]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_CHATBOT_API_URL;
      if (!apiUrl) throw new Error("no-api");

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          id: Date.now() + 1,
          text: data.reply ?? data.message ?? data.answer ?? "No response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          id: Date.now() + 1,
          text: "I'm still being set up! In the meantime, feel free to reach out via the Contact section below. 👇",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Chat window ── */}
      <div
        className={`chatbot-window ${open ? "chatbot-open" : ""}`}
        role="dialog"
        aria-label="Chat with Alkairis AI"
        // The window is hidden with opacity + pointer-events, not display:none,
        // so while closed its input and buttons stayed in the tab order inside
        // an aria-hidden container — keyboard users landed in an invisible
        // form. `inert` removes the subtree from both the tab order and the
        // accessibility tree, which is what aria-hidden alone could not do.
        inert={!open}
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="flex items-center gap-3">
            <div className="chatbot-avatar">
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#0f172a] leading-tight">
                Ask Alkairis
              </p>
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(15,23,42,0.42)" }}
              >
                AI · Resume-powered
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="chatbot-close"
            aria-label="Close chat"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-msg ${
                msg.role === "user" ? "chatbot-msg-user" : "chatbot-msg-bot"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chatbot-msg chatbot-msg-bot chatbot-typing">
              <span />
              <span />
              <span />
            </div>
          )}

          {/* Suggestion chips — only shown until first user message */}
          {showSuggestions && !loading && (
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chatbot-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="chatbot-input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about experience, skills…"
            disabled={loading}
            className="chatbot-input"
            aria-label="Chat message"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="chatbot-send"
            aria-label="Send message"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`chatbot-fab ${open ? "chatbot-fab-active" : ""}`}
        aria-label={open ? "Close chat" : "Chat with Alkairis AI"}
        aria-expanded={open}
      >
        <span className="chatbot-fab-ring" aria-hidden="true" />
        <FontAwesomeIcon icon={open ? faXmark : faCommentDots} />
      </button>
    </>
  );
};

export default ChatBot;
