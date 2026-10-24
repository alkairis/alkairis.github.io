<div align="center">

<img src="assets/banner.png" alt="Deepak Singh Rajput — Senior Software Engineer · Generative AI & Cloud" width="100%" />

<br/>

[![Live](https://img.shields.io/badge/🌐_Live-alkairis.github.io-4cc9f0?style=for-the-badge&labelColor=0f172a)](https://alkairis.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-alkairis-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=0f172a)](https://www.linkedin.com/in/alkairis/)
[![Medium](https://img.shields.io/badge/Medium-@alkairis-white?style=for-the-badge&logo=medium&logoColor=black&labelColor=0f172a)](https://alkairis.medium.com)
[![X](https://img.shields.io/badge/X-@alkairis__-white?style=for-the-badge&logo=x&logoColor=white&labelColor=0f172a)](https://x.com/alkairis_)

<br/>

> ### *Shipping RAG pipelines, agentic workflows, and cloud-native systems that solve real problems at scale.*

</div>

---

## 🧠 whoami

**Deepak Singh Rajput** — Senior Software Engineer, India · IST (UTC+5:30).

Four-plus years at [Impetus Technologies](https://www.impetus.com/) building **production** Generative AI — retrieval pipelines that stay accurate on real corpora, agentic LLM workflows that don't fall over on the third tool call, and the data platform migrations underneath them. **GCP Generative AI Leader certified.**

The parts I care about: grounding retrieval so it actually retrieves, keeping agent graphs debuggable, and the unglamorous cost/latency/reliability work that decides whether an LLM feature survives contact with production.

| Domain | Stack |
|---|---|
| 🤖 **GenAI** | LangChain · LangGraph · RAG pipelines · Agentic workflows · Function calling · Prompt engineering · Vector embeddings · LangSmith · MCP · Hugging Face · Ollama |
| 🧮 **Vector & Data** | FAISS · Chroma · Pinecone · PostgreSQL · MySQL · MongoDB · Redis |
| ☁️ **Cloud** | BigQuery · Dataproc · Cloud Composer · Cloud Run · GCS · Artifact Registry · Cloud Functions · Cloud Secrets · AWS |
| 🐍 **Languages** | Python (OOP · async) · TypeScript · SQL |
| ⚙️ **Frameworks** | FastAPI · Pydantic · REST · React |
| 🔧 **DevOps** | Terraform · Docker · Git · uv |

**Awards** — Excellence Award, Transformational Performance (Impetus, 2026) · iAppreciate Award (Impetus, 2026)

**Certifications** — GCP Generative AI Leader (Google Cloud, 2025) · HuggingFace AI Agents (2025) · GenAI Fundamentals (Databricks, 2024) · Associate Cloud Engineer (Google Cloud, 2023)

---

## 🏗️ This repo: the portfolio as a system

Most portfolios are a static page with the content hardcoded in JSX. This one is a **React front end over a real REST API**, with its own JWT-gated CMS — so updating a project or a certification is a form submission, not a commit and redeploy.

```mermaid
flowchart LR
    subgraph browser["🖥️ Browser — React 19 · Vite 6"]
        UI["Public portfolio<br/>Hero · Projects · Experience · Skills"]
        CMS["/admin-me<br/>JWT-gated CMS"]
        FALLBACK[("Bundled static<br/>fallback content")]
    end

    API["REST API<br/>FastAPI · JWT auth"]
    STORE[("Content store")]
    RESEND["Resend<br/>contact email"]
    MEDIUM["Medium"]

    UI -->|"axios · typed DTOs"| API
    CMS -->|"CRUD · Bearer token"| API
    API --> STORE
    API --> RESEND
    MEDIUM -->|"posts"| API
    FALLBACK -.->|"cold start or API down"| UI
```

> **Note** — the API is a separate service and isn't in this repo. The front end falls back to bundled static content without it, so `npm run dev` works standalone.

---

## 🛠️ Stack

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-2D3748?style=flat-square&logo=react&logoColor=white)

</div>

- **Rendering**: React 19, Vite 6, and client-side routing via React Router 7 (`/`, `/resume`, and the CMS routes).
- **Styling**: hand-written CSS on a small token system: warm paper and deep-ink themes with one teal accent, Geist for text, Geist Mono for data and Instrument Serif for emphasis. Fonts are self-hosted through Fontsource, so the page makes no third-party font requests.
- **The ghost**: a floating assistant whose eyes follow the cursor. Click it, or press `⌘K` / `Ctrl+K` / `/`, to open an AI menu that answers questions about the site with **Okapi BM25 over the site's own content**. It runs in the browser with no LLM call. The answers are extractive, cite their sources, and show the trace: expanded query terms, chunks matched, and time taken. The same menu works as a command palette for navigation and actions.
- **Case studies**: each one comes with an SVG architecture diagram drawn from a small layout spec, with an animated data-flow direction. On narrow screens the diagram scrolls sideways instead of shrinking.
- **State & data**: Zustand stores and module-cached resource hooks with in-flight request de-duplication. The axios client uses JWT interceptors. Every section has bundled fallback content for API cold starts.
- **Resume**: `/resume` renders the same CMS data as a printable page. Its print stylesheet produces a clean A4 PDF.
- **CI/CD**: GitHub Actions deploys to GitHub Pages, running `npm ci`, ESLint and a `tsc --noEmit` gate against a reproducible lockfile.

---

## 🚀 Running it locally

```bash
git clone https://github.com/alkairis/alkairis.github.io.git
cd alkairis.github.io
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server, proxying `/api` and `/blog` to `localhost:8080` |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | `tsc --noEmit` over the TypeScript layer |
| `npm run lint` | ESLint, including the React Hooks rules |
| `npm run preview` | Serve the production build locally |

Without a backend running, every section falls back to its bundled content — so the site is fully browsable out of the box.

<details>
<summary><b>Environment variables</b> (all optional — the app tolerates missing values)</summary>

<br/>

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend origin | `/` (same-origin; dev proxies to `:8080`) |
| `VITE_API_TIMEOUT_MS` | Request timeout | `15000` |
| `VITE_BASE` | Public base path override | `/` |

</details>

---

## 📁 Layout

```text
src/
├─ api/          typed axios client: DTOs, domain types, JWT interceptors
├─ content/      what the CMS doesn't model: headline profile facts, case studies
├─ sections/     home-page sections (Hero, Work, Experience, Toolbox, …)
├─ components/   nav, ghost + AI menu, ask console, diagrams, icons
├─ lib/          BM25 retrieval engine and the site corpus builder
├─ hooks/        shared data hooks (module-cached), search index, scroll reveal
├─ stores/       Zustand stores: theme, blog, assistant
├─ constants/    static fallback content and social-icon mapping
├─ styles/       site and resume (screen + print) stylesheets
└─ pages/        /resume, plus the JWT-gated admin CMS routes
```

---

## 📝 License

[MIT](LICENSE) — use it as reference or inspiration, but please don't deploy it as-is with my name, photo, or personal content. Build your own story.

<div align="center">
<br/>

**Built with ☕ and too many `console.log`s**

[![alkairis.github.io](https://img.shields.io/badge/alkairis.github.io-0f172a?style=for-the-badge&logo=github&logoColor=4cc9f0)](https://alkairis.github.io)

*If this was useful, a ⭐ goes a long way.*

</div>
