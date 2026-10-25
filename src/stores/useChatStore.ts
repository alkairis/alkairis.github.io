import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AskErrorKind } from "../lib/ask";

export type TurnStatus = "loading" | "done" | "error";

/** One question and its answer. */
export type Turn = {
  id: string;
  question: string;
  status: TurnStatus;
  answer: string;
  errorKind: AskErrorKind | null;
  /** Where the answer came from: the site's own data, or the LLM. */
  source: "site" | "llm" | null;
};

/** How many turns survive a reload; older ones drop off the top. */
const KEEP_TURNS = 30;

type ChatStore = {
  turns: Turn[];
  add: (question: string) => string;
  update: (id: string, patch: Partial<Omit<Turn, "id" | "question">>) => void;
  clear: () => void;
};

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

/**
 * The ghost's conversation, shared by the AI menu and the hero console and
 * kept in sessionStorage, so it survives closing the menu and reloading the
 * page but not closing the tab. A turn still loading when the page unloads
 * isn't saved.
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      turns: [],
      add: (question) => {
        const id = newId();
        set((s) => ({
          turns: [...s.turns, { id, question, status: "loading", answer: "", errorKind: null, source: null }],
        }));
        return id;
      },
      update: (id, patch) => set((s) => ({ turns: s.turns.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      clear: () => set({ turns: [] }),
    }),
    {
      name: "alkairis-ghost-chat",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ turns: s.turns.filter((t) => t.status !== "loading").slice(-KEEP_TURNS) }),
    },
  ),
);
