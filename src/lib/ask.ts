/**
 * Client for the ghost's LLM endpoint.
 *
 * POST VITE_CHATBOT_API_URL  { "message": "<question>" }
 *   → JSON { "reply" | "answer" | "message" | "response" | "output" | "text": "<answer>" }
 *     or a plain-text body.
 *
 * The URL is a build-time variable (a GitHub repo variable in deploy.yml), so
 * the model and its context live on the backend, never in this bundle.
 */

const TIMEOUT_MS = 45_000;
const REPLY_KEYS = ["reply", "answer", "message", "response", "output", "text"] as const;

export type AskErrorKind = "unconfigured" | "timeout" | "network" | "http" | "empty";

export class AskError extends Error {
  constructor(
    readonly kind: AskErrorKind,
    readonly status?: number,
  ) {
    super(kind);
    this.name = "AskError";
  }
}

const pickReply = (data: unknown): string => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    for (const key of REPLY_KEYS) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return "";
};

/** Ask the LLM one question. Rejects with AskError, or AbortError if `signal` aborts. */
export const askGhost = async (question: string, signal?: AbortSignal): Promise<string> => {
  const url = import.meta.env.VITE_CHATBOT_API_URL;
  if (!url) throw new AskError("unconfigured");

  // Our own controller so a slow model times out, chained to the caller's.
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/plain" },
      body: JSON.stringify({ message: question }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new AskError("http", res.status);

    const isJson = res.headers.get("content-type")?.includes("json");
    const reply = pickReply(isJson ? await res.json() : await res.text()).trim();
    if (!reply) throw new AskError("empty");
    return reply;
  } catch (err) {
    if (err instanceof AskError) throw err;
    if (signal?.aborted) throw err; // the caller cancelled; not an error to show
    throw new AskError(timedOut ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
};
