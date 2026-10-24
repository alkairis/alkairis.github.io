// A small, honest retrieval engine: Okapi BM25 over the site's own content.
//
// It powers the "Ask" console in the hero and the ghost's AI menu. There is no
// LLM call and nothing leaves the browser: a question is tokenised, expanded
// with a few domain synonyms, scored against every chunk, and the best
// passages come back with their sources and the timings it took to find them.

export type Doc = {
  id: string;
  title: string;
  /** Short label of where the chunk lives ("Experience", "Case study"…). */
  source: string;
  /** In-page anchor ("#work") or an external URL. */
  href: string;
  text: string;
};

export type Hit = {
  doc: Doc;
  score: number;
  /** The sentence(s) of the chunk that best match the query. */
  passage: string;
};

export type SearchResult = {
  query: string;
  terms: string[];
  hits: Hit[];
  /** How many chunks contained at least one query term. */
  matched: number;
  scanned: number;
  ms: number;
};

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can could did do does doing for from had has have he her his how i if in " +
    "into is it its me my of on or our she so than that the their them then there these they this those to " +
    "too was we were what when where which who whom why will with would you your about tell deepak deepaks " +
    "kind sort type thing things " +
    "singh rajput he him his does any some much many also just more most very"
  ).split(" ")
);

// Query-side expansion: a recruiter asking "is he open to roles?" should land
// on the availability chunk even though it never says "open to roles" verbatim.
const SYNONYMS: Record<string, string> = {
  rag: "retrieval grounding generation",
  build: "built ship pipeline system production",
  builds: "built ship pipeline system production",
  ship: "built ship production",
  do: "built ship work",
  llm: "llm generative model",
  llms: "llm generative model",
  genai: "generative ai",
  gen: "generative",
  ai: "ai generative",
  agent: "agentic langgraph agent",
  agents: "agentic langgraph agent",
  agentic: "agentic langgraph",
  hire: "availability open roles hiring",
  hiring: "availability open roles hiring",
  available: "availability open roles",
  availability: "availability open roles",
  job: "availability roles",
  jobs: "availability roles",
  open: "availability open",
  role: "roles availability",
  roles: "roles availability",
  notice: "availability",
  remote: "remote availability",
  cloud: "cloud gcp aws google",
  gcp: "gcp google cloud bigquery",
  google: "google gcp",
  aws: "aws amazon bedrock",
  contact: "contact email reach",
  email: "email contact",
  reach: "contact email",
  cert: "certification certified",
  certs: "certification certified",
  certified: "certification certified",
  certificate: "certification certified",
  certificates: "certification certified",
  certifications: "certification certified",
  award: "award recognition excellence",
  awards: "award recognition excellence",
  recognition: "award recognition",
  where: "location based bengaluru india",
  location: "location based bengaluru india",
  based: "location bengaluru india",
  live: "location bengaluru india",
  stack: "stack skills tools",
  tools: "tools skills stack",
  tech: "skills stack technologies",
  skills: "skills stack",
  vector: "vector faiss chroma pinecone embeddings",
  database: "databases postgresql mongodb redis vector",
  data: "data bigquery dataproc migration pipelines",
  migration: "migration bigquery dataproc composer",
  years: "years experience",
  experience: "experience roles",
  work: "work experience projects",
  write: "writing medium posts blog",
  blog: "blog medium posts writing",
  articles: "blog medium posts writing",
  education: "education university degree",
  degree: "education degree university",
  study: "education degree",
  langgraph: "langgraph agentic",
  langchain: "langchain rag",
  python: "python",
};

const stem = (word: string): string => {
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

const rawTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .split(" ")
    .filter(Boolean);

export const tokenize = (text: string): string[] =>
  rawTokens(text)
    .filter((t) => !STOPWORDS.has(t) && (t.length > 1 || /\d/.test(t)))
    .map(stem);

/** A query term and how much it counts: typed words 1, synonym expansions less. */
export type QueryTerm = { term: string; weight: number };

const EXPANSION_WEIGHT = 0.45;

/** Query terms after stop-word removal, synonym expansion and stemming. */
export const queryTerms = (query: string): QueryTerm[] => {
  const weights = new Map<string, number>();
  const add = (t: string, w: number) => {
    if (t.length < 2 && !/\d/.test(t)) return;
    const term = stem(t);
    weights.set(term, Math.max(weights.get(term) ?? 0, w));
  };
  for (const token of rawTokens(query)) {
    // A stop word contributes only its expansion ("do" → built, ship…).
    if (!STOPWORDS.has(token)) add(token, 1);
    SYNONYMS[token]?.split(" ").forEach((t) => add(t, EXPANSION_WEIGHT));
  }
  return [...weights].map(([term, weight]) => ({ term, weight })).sort((a, b) => b.weight - a.weight);
};

const sentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

const bestPassage = (text: string, terms: Set<string>): string => {
  const parts = sentences(text);
  if (parts.length <= 1) return text.trim();

  let best = 0;
  let bestScore = -1;
  parts.forEach((part, i) => {
    const tokens = new Set(tokenize(part));
    let score = 0;
    terms.forEach((t) => {
      if (tokens.has(t)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });

  // A lone short sentence reads as a fragment; pair it with the next one.
  const first = parts[best] ?? "";
  const next = parts[best + 1];
  return first.length < 90 && next ? `${first} ${next}` : first;
};

const K1 = 1.4;
const B = 0.75;
const TITLE_WEIGHT = 2;

export class SearchIndex {
  private readonly docs: Doc[];
  private readonly termFreqs: Map<string, number>[];
  private readonly lengths: number[];
  private readonly docFreq = new Map<string, number>();
  private readonly avgLength: number;

  constructor(docs: Doc[]) {
    this.docs = docs;
    this.termFreqs = docs.map((doc) => {
      const tf = new Map<string, number>();
      const add = (term: string, weight: number) => tf.set(term, (tf.get(term) ?? 0) + weight);
      tokenize(doc.title).forEach((t) => add(t, TITLE_WEIGHT));
      tokenize(doc.text).forEach((t) => add(t, 1));
      return tf;
    });
    this.lengths = this.termFreqs.map((tf) => [...tf.values()].reduce((sum, n) => sum + n, 0));
    this.avgLength = this.lengths.reduce((sum, n) => sum + n, 0) / Math.max(docs.length, 1);
    this.termFreqs.forEach((tf) => {
      tf.forEach((_count, term) => this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1));
    });
  }

  get size(): number {
    return this.docs.length;
  }

  search(query: string, k = 3): SearchResult {
    const started = performance.now();
    const weighted = queryTerms(query);
    const terms = weighted.map((q) => q.term);
    const termSet = new Set(terms);
    const n = this.docs.length;

    const scored: { index: number; score: number }[] = [];
    this.termFreqs.forEach((tf, index) => {
      let score = 0;
      const length = this.lengths[index] ?? 0;
      for (const { term, weight } of weighted) {
        const freq = tf.get(term);
        if (!freq) continue;
        const df = this.docFreq.get(term) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        score += (weight * idf * freq * (K1 + 1)) / (freq + K1 * (1 - B + (B * length) / this.avgLength));
      }
      if (score > 0) scored.push({ index, score });
    });

    scored.sort((a, b) => b.score - a.score);

    const hits: Hit[] = [];
    for (const { index, score } of scored.slice(0, k)) {
      const doc = this.docs[index];
      if (doc) hits.push({ doc, score, passage: bestPassage(doc.text, termSet) });
    }

    return {
      query,
      terms,
      hits,
      matched: scored.length,
      scanned: n,
      ms: performance.now() - started,
    };
  }
}
