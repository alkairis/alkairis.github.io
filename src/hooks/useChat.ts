import { useCallback } from "react";
import { AskError, askGhost } from "../lib/ask";
import type { ChatMessage } from "../lib/ask";
import { siteAnswer } from "../lib/siteAnswers";
import { useChatStore } from "../stores/useChatStore";
import type { Turn } from "../stores/useChatStore";
import { useSiteData } from "./useSiteData";
import type { SiteData } from "./useSiteData";

// Let the "Boo!" play at least once, even for instant (site) answers.
const MIN_LOADING_MS = 900;
// Earlier turns sent to the LLM as context (each is a question + an answer).
const HISTORY_TURNS = 6;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Answered turns before `index`, as chat messages, oldest first. */
const historyBefore = (turns: Turn[], index: number): ChatMessage[] =>
  turns
    .slice(0, index)
    .filter((t) => t.status === "done")
    .slice(-HISTORY_TURNS)
    .flatMap((t) => [
      { role: "user" as const, content: t.question },
      { role: "assistant" as const, content: t.answer },
    ]);

// The request in flight lives outside React, so closing the menu doesn't
// cancel it: the answer still lands in the shared conversation.
let inflight: AbortController | null = null;

const answerTurn = async (id: string, data: SiteData) => {
  const { turns, update } = useChatStore.getState();
  const index = turns.findIndex((t) => t.id === id);
  const turn = turns[index];
  if (!turn) return;

  const ctrl = new AbortController();
  inflight = ctrl;
  const started = performance.now();
  let patch: Partial<Turn>;

  const local = siteAnswer(turn.question, data);
  if (local) {
    patch = { status: "done", answer: local, source: "site", errorKind: null };
  } else {
    try {
      const answer = await askGhost(turn.question, historyBefore(turns, index), ctrl.signal);
      patch = { status: "done", answer, source: "llm", errorKind: null };
    } catch (err) {
      if (ctrl.signal.aborted) return;
      patch = { status: "error", errorKind: err instanceof AskError ? err.kind : "network" };
    }
  }

  await wait(Math.max(0, MIN_LOADING_MS - (performance.now() - started)));
  if (ctrl.signal.aborted) return;
  if (inflight === ctrl) inflight = null;
  update(id, patch);
};

const isBusy = () => useChatStore.getState().turns.some((t) => t.status === "loading");

/**
 * The ghost's conversation and how to add to it. One question at a time:
 * asking while an answer is loading does nothing (the UI disables it too).
 */
export const useChat = () => {
  const turns = useChatStore((s) => s.turns);
  const data = useSiteData();
  const busy = turns.some((t) => t.status === "loading");

  const ask = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || isBusy()) return;
      void answerTurn(useChatStore.getState().add(question), data);
    },
    [data],
  );

  const retry = useCallback(
    (id: string) => {
      if (isBusy()) return;
      useChatStore.getState().update(id, { status: "loading", errorKind: null });
      void answerTurn(id, data);
    },
    [data],
  );

  const clear = useCallback(() => {
    inflight?.abort();
    inflight = null;
    useChatStore.getState().clear();
  }, []);

  return { turns, busy, ask, retry, clear };
};
