import type { CSSProperties } from "react";
import type { DiagramKind } from "../content/caseStudies";

type Side = "l" | "r" | "t" | "b";
type NodeKind = "io" | "step" | "store" | "model" | "aux";

type DNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  kind?: NodeKind;
};

type DEdge = {
  from: string;
  to: string;
  fs?: Side;
  ts?: Side;
  label?: string;
  /** Secondary relationship (orchestration, tracing, retries): dashed, no flow. */
  soft?: boolean;
  /** Extra bend for edges that would otherwise cut through nodes. */
  bend?: number;
};

type Spec = { w: number; h: number; nodes: DNode[]; edges: DEdge[] };

// Coordinates are in viewBox units. Each layout reads left → right, with
// supporting systems below or to the side, and is drawn to stay legible at
// ~620px — narrower screens scroll the figure horizontally instead.
const SPECS: Record<DiagramKind, Spec> = {
  rag: {
    w: 660,
    h: 270,
    nodes: [
      { id: "q", x: 8, y: 30, w: 104, h: 56, label: "User query", sub: "question", kind: "io" },
      { id: "ret", x: 150, y: 30, w: 132, h: 56, label: "Hybrid retrieval", sub: "dense + keyword" },
      { id: "rr", x: 320, y: 30, w: 110, h: 56, label: "Rerank", sub: "precision@k" },
      { id: "gen", x: 470, y: 30, w: 182, h: 56, label: "Grounded generation", sub: "LLM · context only", kind: "model" },
      { id: "docs", x: 8, y: 182, w: 104, h: 56, label: "Documents", sub: "source corpus", kind: "io" },
      { id: "chunk", x: 150, y: 182, w: 132, h: 56, label: "Chunk + embed", sub: "metadata kept" },
      { id: "vec", x: 320, y: 182, w: 110, h: 56, label: "Vector index", sub: "FAISS · Chroma", kind: "store" },
      { id: "ans", x: 470, y: 182, w: 182, h: 56, label: "Answer + citations", sub: "via FastAPI", kind: "io" },
    ],
    edges: [
      { from: "q", to: "ret" },
      { from: "ret", to: "rr", label: "top-k" },
      { from: "rr", to: "gen", label: "top-n" },
      { from: "docs", to: "chunk" },
      { from: "chunk", to: "vec" },
      { from: "vec", to: "ret", fs: "t", ts: "b", label: "ANN" },
      { from: "gen", to: "ans", fs: "b", ts: "t", label: "cites" },
    ],
  },
  agent: {
    w: 680,
    h: 290,
    nodes: [
      { id: "task", x: 8, y: 104, w: 92, h: 56, label: "Task", sub: "user goal", kind: "io" },
      { id: "plan", x: 134, y: 104, w: 116, h: 56, label: "Planner", sub: "LLM · state", kind: "model" },
      { id: "route", x: 284, y: 104, w: 116, h: 56, label: "Tool router", sub: "function calls" },
      { id: "t1", x: 438, y: 34, w: 108, h: 44, label: "Internal APIs", kind: "aux" },
      { id: "t2", x: 438, y: 110, w: 108, h: 44, label: "Retriever", kind: "aux" },
      { id: "t3", x: 438, y: 186, w: 108, h: 44, label: "MCP tools", kind: "aux" },
      { id: "ref", x: 580, y: 104, w: 92, h: 56, label: "Reflect", sub: "validate" },
      { id: "out", x: 580, y: 224, w: 92, h: 50, label: "Result", kind: "io" },
      { id: "trace", x: 134, y: 224, w: 266, h: 50, label: "LangSmith traces", sub: "every step, replayable", kind: "store" },
    ],
    edges: [
      { from: "task", to: "plan" },
      { from: "plan", to: "route", label: "state" },
      { from: "route", to: "t1" },
      { from: "route", to: "t2" },
      { from: "route", to: "t3" },
      { from: "t1", to: "ref" },
      { from: "t2", to: "ref" },
      { from: "t3", to: "ref" },
      { from: "ref", to: "out", fs: "b", ts: "t", label: "done" },
      { from: "ref", to: "plan", fs: "t", ts: "t", soft: true, label: "retry · bounded", bend: -96 },
      { from: "plan", to: "trace", fs: "b", ts: "t", soft: true },
      { from: "route", to: "trace", fs: "b", ts: "t", soft: true },
    ],
  },
  migration: {
    w: 690,
    h: 280,
    nodes: [
      { id: "wh", x: 8, y: 42, w: 128, h: 56, label: "On-prem data", sub: "tables · files", kind: "io" },
      { id: "jobs", x: 8, y: 180, w: 128, h: 56, label: "Legacy jobs", sub: "batch pipelines", kind: "io" },
      { id: "gcs", x: 176, y: 111, w: 112, h: 56, label: "GCS landing", sub: "raw zone", kind: "store" },
      { id: "dp", x: 328, y: 42, w: 120, h: 56, label: "Dataproc", sub: "Spark jobs" },
      { id: "bq", x: 328, y: 180, w: 120, h: 56, label: "BigQuery", sub: "warehouse", kind: "store" },
      { id: "cmp", x: 500, y: 28, w: 182, h: 48, label: "Cloud Composer", sub: "orchestration", kind: "aux" },
      { id: "api", x: 500, y: 116, w: 182, h: 52, label: "FastAPI services", sub: "AI-driven features", kind: "model" },
      { id: "tf", x: 500, y: 206, w: 182, h: 48, label: "Terraform", sub: "environments as code", kind: "aux" },
    ],
    edges: [
      { from: "wh", to: "gcs" },
      { from: "jobs", to: "gcs" },
      { from: "gcs", to: "dp" },
      { from: "gcs", to: "bq" },
      { from: "dp", to: "bq", fs: "b", ts: "t", label: "load" },
      { from: "bq", to: "api", label: "serve" },
      { from: "cmp", to: "dp", fs: "l", ts: "r", soft: true, label: "schedules" },
      { from: "tf", to: "bq", fs: "l", ts: "r", soft: true, label: "provisions" },
    ],
  },
  system: {
    w: 640,
    h: 280,
    nodes: [
      { id: "spa", x: 8, y: 28, w: 150, h: 56, label: "React 19 site", sub: "public, typed DTOs", kind: "io" },
      { id: "fb", x: 8, y: 112, w: 150, h: 50, label: "Bundled fallbacks", sub: "cold-start safe", kind: "aux" },
      { id: "cms", x: 8, y: 196, w: 150, h: 56, label: "/admin-me CMS", sub: "JWT-gated", kind: "io" },
      { id: "api", x: 236, y: 110, w: 140, h: 60, label: "FastAPI", sub: "REST · JWT auth", kind: "model" },
      { id: "db", x: 470, y: 24, w: 162, h: 52, label: "Content store", kind: "store" },
      { id: "mail", x: 470, y: 114, w: 162, h: 52, label: "Resend", sub: "contact email", kind: "aux" },
      { id: "md", x: 470, y: 204, w: 162, h: 52, label: "Medium", sub: "posts", kind: "aux" },
    ],
    edges: [
      { from: "spa", to: "api", label: "GET" },
      { from: "cms", to: "api", label: "CRUD" },
      { from: "fb", to: "spa", fs: "t", ts: "b", soft: true },
      { from: "api", to: "db" },
      { from: "api", to: "mail" },
      { from: "md", to: "api", fs: "l", ts: "r" },
    ],
  },
};

const anchor = (n: DNode, side: Side): [number, number] => {
  switch (side) {
    case "l":
      return [n.x, n.y + n.h / 2];
    case "r":
      return [n.x + n.w, n.y + n.h / 2];
    case "t":
      return [n.x + n.w / 2, n.y];
    case "b":
      return [n.x + n.w / 2, n.y + n.h];
  }
};

const normal: Record<Side, [number, number]> = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };

const edgePath = (a: DNode, b: DNode, e: DEdge) => {
  const fs = e.fs ?? "r";
  const ts = e.ts ?? "l";
  const [x1, y1] = anchor(a, fs);
  const [x2, y2] = anchor(b, ts);
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const k = e.bend !== undefined ? Math.abs(e.bend) : Math.max(24, dist * 0.42);
  const [n1x, n1y] = normal[fs];
  const [n2x, n2y] = normal[ts];
  const c1: [number, number] = [x1 + n1x * k, y1 + n1y * k];
  const c2: [number, number] = [x2 + n2x * k, y2 + n2y * k];
  // Midpoint of the cubic at t = 0.5, for the label.
  const mx = (x1 + 3 * c1[0] + 3 * c2[0] + x2) / 8;
  const my = (y1 + 3 * c1[1] + 3 * c2[1] + y2) / 8;
  return { d: `M${x1} ${y1}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x2} ${y2}`, mx, my };
};

type DiagramProps = { kind: DiagramKind; title: string };

/**
 * An architecture figure drawn from a small layout spec. Edges carry a moving
 * dash in the case study's accent colour to show the direction data flows;
 * dashed grey edges are supporting relationships (orchestration, tracing).
 */
const Diagram = ({ kind, title }: DiagramProps) => {
  const spec = SPECS[kind];
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const markerId = `arrow-${kind}`;

  return (
    <svg
      className="diagram"
      viewBox={`0 0 ${spec.w} ${spec.h}`}
      role="img"
      aria-label={title}
      // Below ~640px the figure scrolls sideways at this width rather than
      // shrinking its labels past legibility (see .diagram in site.css).
      style={{ "--min-w": `${Math.round(spec.w * 0.92)}px` } as CSSProperties}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1.5 9 5 1 8.5" className="d-arrow" />
        </marker>
      </defs>

      {spec.edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const { d, mx, my } = edgePath(a, b, e);
        return (
          <g key={i} className={e.soft ? "d-edge is-soft" : "d-edge"}>
            <path d={d} className="d-line" markerEnd={`url(#${markerId})`} />
            {!e.soft && <path d={d} className="d-flow" style={{ animationDelay: `${(i % 4) * -0.35}s` }} />}
            {e.label && (
              <text x={mx} y={my - 6} className="d-label" textAnchor="middle">
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {spec.nodes.map((n) => (
        <g key={n.id} className={`d-node is-${n.kind ?? "step"}`}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="11" />
          {n.kind === "store" && <path d={`M${n.x + 10} ${n.y + 7}h${n.w - 20}`} className="d-store-line" />}
          <text x={n.x + n.w / 2} y={n.y + n.h / 2 + (n.sub ? -3 : 5)} textAnchor="middle" className="d-title">
            {n.label}
          </text>
          {n.sub && (
            <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 14} textAnchor="middle" className="d-sub">
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

export default Diagram;
