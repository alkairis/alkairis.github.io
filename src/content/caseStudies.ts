// Selected work, written as case studies.
//
// The CMS's project model (name, description, links, tech, image) can't carry
// a case study — there's no room for the role, the decisions or a diagram — so
// these live in the front end and the API's projects render separately as
// "More projects".
//
// Keep every claim here something you'd be happy to defend in an interview.
// `metrics` renders only when it has entries: add real numbers (latency,
// retrieval hit-rate, cost per query, jobs migrated…) as you're able to share
// them, and the cards pick them up automatically.

export type DiagramKind = "rag" | "agent" | "migration" | "system";
export type Accent = "teal" | "indigo" | "amber" | "rose";

export type CaseStudy = {
  slug: string;
  client: string;
  period: string;
  title: string;
  role: string;
  summary: string;
  bullets: string[];
  chips: string[];
  stack: string[];
  diagram: DiagramKind;
  diagramCaption: string;
  accent: Accent;
  decisions: { title: string; body: string }[];
  metrics: { value: string; label: string }[];
  links: { label: string; href: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "grounded-rag",
    client: "Impetus Technologies",
    period: "Ongoing",
    title: "Retrieval pipelines that stay grounded on real enterprise corpora",
    role: "Senior Software Engineer",
    summary:
      "Production RAG where the hard part isn't the prompt — it's making retrieval return the right passage from messy, real-world documents, every time.",
    bullets: [
      "Built end-to-end RAG pipelines with LangChain: ingestion, chunking, embeddings, vector search and grounded generation.",
      "Treated retrieval quality as the primary metric, measuring what comes back before tuning what the model says.",
      "Shipped them as FastAPI services with typed Pydantic contracts, so product teams consume answers, not prompts.",
    ],
    chips: ["RAG", "Grounding", "Vector search", "FastAPI"],
    stack: ["Python", "LangChain", "FAISS", "Chroma", "Pinecone", "FastAPI", "Pydantic", "GCP", "AWS"],
    diagram: "rag",
    diagramCaption: "Query path: hybrid retrieval → rerank → grounded generation with citations",
    accent: "teal",
    decisions: [
      {
        title: "Evaluate retrieval before generation",
        body: "If the right chunk isn't in the top-k, no prompt fixes it. Retrieval gets its own checks, separate from answer quality.",
      },
      {
        title: "Every answer carries its sources",
        body: "Generation is constrained to retrieved context and returns citations, which makes wrong answers diagnosable instead of mysterious.",
      },
      {
        title: "Cost and latency are product features",
        body: "Chunk size, top-k and model choice are tuned against response time and per-query cost, not just accuracy.",
      },
    ],
    metrics: [],
    links: [],
  },
  {
    slug: "agentic-workflows",
    client: "Impetus Technologies",
    period: "Ongoing",
    title: "Agentic workflows that don't fall over on the third tool call",
    role: "Senior Software Engineer",
    summary:
      "Multi-step LLM agents built as explicit LangGraph state machines — debuggable, traceable, and bounded — rather than free-running loops.",
    bullets: [
      "Designed agent graphs in LangGraph with explicit state, typed tool contracts and bounded retries.",
      "Used function calling against internal tools and APIs, with MCP where it simplified tool exposure.",
      "Traced runs end to end in LangSmith so a bad step can be found and replayed, not guessed at.",
    ],
    chips: ["LangGraph", "Function calling", "MCP", "Observability"],
    stack: ["Python", "LangGraph", "LangChain", "LangSmith", "MCP", "Pydantic", "FastAPI"],
    diagram: "agent",
    diagramCaption: "Planner → tool router → tools → reflection, with a bounded loop back",
    accent: "indigo",
    decisions: [
      {
        title: "Graphs over loops",
        body: "Every transition is an edge you can read. State is explicit, so a failed run shows exactly where it went wrong.",
      },
      {
        title: "Typed tools, validated outputs",
        body: "Tool inputs and outputs are Pydantic models. A malformed call fails fast at the boundary instead of three steps later.",
      },
      {
        title: "Bounded autonomy",
        body: "Retry and reflection budgets are part of the graph, so an agent degrades to a clear failure instead of spinning.",
      },
    ],
    metrics: [],
    links: [],
  },
  {
    slug: "gcp-migration",
    client: "Impetus Technologies",
    period: "Ongoing",
    title: "Moving large on-prem data workloads onto Google Cloud",
    role: "Senior Software Engineer",
    summary:
      "The data platform underneath the AI work: migrating on-prem pipelines and warehouses to BigQuery, Dataproc and Cloud Composer.",
    bullets: [
      "Migrated large-scale on-prem data workloads to BigQuery and Dataproc.",
      "Orchestrated pipelines with Cloud Composer, with infrastructure defined in Terraform.",
      "Built the FastAPI microservices and REST APIs that serve AI-driven features on top of the migrated platform.",
    ],
    chips: ["Data migration", "BigQuery", "Dataproc", "Terraform"],
    stack: ["Python", "SQL", "BigQuery", "Dataproc", "Cloud Composer", "Cloud Run", "GCS", "Terraform"],
    diagram: "migration",
    diagramCaption: "On-prem sources → GCS landing → Dataproc / BigQuery, orchestrated by Composer",
    accent: "amber",
    decisions: [
      {
        title: "Parity before optimisation",
        body: "Migrated jobs first reproduce the source output exactly; tuning comes after the numbers match.",
      },
      {
        title: "Infrastructure as code",
        body: "Environments are Terraform, so a new pipeline environment is a reviewed change, not a console session.",
      },
    ],
    metrics: [],
    links: [],
  },
  {
    slug: "this-site",
    client: "Personal",
    period: "Live",
    title: "This portfolio, built like a product",
    role: "Designer & engineer",
    summary:
      "A React front end over a FastAPI CMS with JWT auth, static fallbacks for cold starts, and a retrieval engine that answers questions about my work right in your browser.",
    bullets: [
      "Content is edited through a JWT-gated CMS, so updating a role or a certificate is a form submission, not a redeploy.",
      "Every section ships bundled fallback content, so the page is complete even while the API cold-starts.",
      "The ghost in the corner runs BM25 retrieval over this site's own content — no LLM call, no tracking.",
    ],
    chips: ["React 19", "FastAPI CMS", "Client-side retrieval", "Accessibility"],
    stack: ["TypeScript", "React", "Vite", "Zustand", "FastAPI", "JWT", "GitHub Actions"],
    diagram: "system",
    diagramCaption: "Browser ↔ REST API ↔ content store, with bundled fallbacks for cold starts",
    accent: "rose",
    decisions: [
      {
        title: "Content is data",
        body: "Sections render from typed API DTOs; the design never hardcodes a role, project or certificate.",
      },
      {
        title: "Never an empty section",
        body: "The API host sleeps when idle. Fallback content renders instantly and is swapped for live data when it arrives.",
      },
      {
        title: "Show, don't claim",
        body: "Instead of a chatbot that calls a paid API, retrieval runs locally and shows its working: terms, scores, sources.",
      },
    ],
    metrics: [],
    links: [{ label: "View source", href: "https://github.com/alkairis/alkairis.github.io" }],
  },
];
