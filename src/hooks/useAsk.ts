import { useCallback, useEffect, useRef, useState } from "react";
import { AskError, askGhost } from "../lib/ask";

// Let the "Boo!" play at least once, even when the API answers instantly.
const MIN_LOADING_MS = 900;

export type AskStatus = "idle" | "loading" | "done" | "error";

export type AskState = {
  status: AskStatus;
  question: string;
  answer: string;
  error: AskError | null;
};

const IDLE: AskState = { status: "idle", question: "", answer: "", error: null };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One question at a time to the ghost's LLM. A new question cancels the one in
 * flight, and so do reset() and unmounting, so a late reply never lands in
 * the wrong place.
 */
export const useAsk = () => {
  const [state, setState] = useState<AskState>(IDLE);
  const inflight = useRef<AbortController | null>(null);

  const ask = useCallback(async (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setState({ status: "loading", question, answer: "", error: null });

    const started = performance.now();
    let next: AskState;
    try {
      const answer = await askGhost(question, ctrl.signal);
      next = { status: "done", question, answer, error: null };
    } catch (err) {
      if (ctrl.signal.aborted) return;
      next = { status: "error", question, answer: "", error: err instanceof AskError ? err : new AskError("network") };
    }
    await wait(Math.max(0, MIN_LOADING_MS - (performance.now() - started)));
    if (!ctrl.signal.aborted) setState(next);
  }, []);

  const reset = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    setState(IDLE);
  }, []);

  useEffect(() => () => inflight.current?.abort(), []);

  return { ...state, ask, reset };
};
