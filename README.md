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
![Tailwind](https://img.shields.io/badge/Tailwind_v4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38bdf8)
![Three.js](https://img.shields.io/badge/Three.js_·_R3F-black?style=flat-square&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP_3-88CE02?style=flat-square&logo=greensock&logoColor=black)
![Zustand](https://img.shields.io/badge/Zustand-2D3748?style=flat-square&logo=react&logoColor=white)

</div>

- **Rendering** — React 19, Vite 6, client-side routing via React Router 7
- **Styling** — Tailwind v4 (`@tailwindcss/vite`) + hand-authored CSS for the glass/glow surfaces
- **State & data** — Zustand stores with in-flight request de-duplication, axios client with JWT interceptors
- **Motion** — GSAP + ScrollTrigger for scroll reveals; `@react-three/fiber` for the hero field; a hand-ported WebGL fluid solver for the cursor
- **CI/CD** — GitHub Actions → GitHub Pages, with `npm ci`, a `tsc --noEmit` gate, and a reproducible lockfile

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
├─ api/          typed axios client — DTOs, domain types, JWT interceptors
├─ sections/     page sections (Hero, Projects, Experience, Skills, …)
├─ components/   reusable UI — modals, buttons, WebGL field, cursor
├─ stores/       Zustand stores with request de-duplication
├─ constants/    nav config + static fallback content
├─ pages/        JWT-gated admin CMS routes
└─ hooks/        shared data hooks (module-cached)
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
