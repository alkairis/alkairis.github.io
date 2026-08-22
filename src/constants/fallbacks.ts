// Static fallback content for the data-driven portfolio sections.
//
// The backend is hosted on a platform that can cold-start ("go to sleep"),
// so the first request after an idle period may be slow to respond or fail
// outright. These fallbacks let Experience, Skills, Certifications and
// Recognitions render meaningful content immediately instead of collapsing
// into empty sections. As soon as the API responds with live data, each
// section swaps its fallback out for the real thing.
//
// Images point at bundled files in /public so a fallback never depends on a
// network round-trip of its own.
import { asset } from '../utils/asset';
import type {
  About,
  Certificate,
  Experience,
  Recognition,
  TechnicalSkill,
} from '../api/api';
import type { RecognitionStat } from '../stores/useRecognitionStore';

// ─── About ──────────────────────────────────────────────────────────────────
export const fallbackAbout: About = {
  photo: asset('dsr.png'),
  headline: 'Senior Software Engineer · Generative AI · AWS & GCP',
  bio: [
    "I'm Deepak Singh Rajput — a Senior Software Engineer based in Bengaluru, India, with 4+ years building production-grade Generative AI and cloud-native systems.",
    'At Impetus Technologies I ship RAG pipelines and agentic LLM workflows with LangChain and LangGraph, and migrate large-scale on-prem data workloads to AWS and Google Cloud (BigQuery, Dataproc, Cloud Composer). I work end to end — Python, FastAPI and TypeScript on the backend, React on the front.',
    "I'm GCP Generative AI Leader certified and always happy to talk about AI systems, data engineering, and scalable cloud architecture.",
  ].join('\n\n'),
  location: 'Bengaluru, Karnataka, India',
  highlights: [
    '4+ years shipping production AI & cloud systems',
    'GCP Generative AI Leader certified',
    'RAG · Agentic AI · LangChain · LangGraph',
    'AWS & Google Cloud · BigQuery · Dataproc',
  ],
};

// ─── Experience ────────────────────────────────────────────────────────────
export const fallbackExperiences: Experience[] = [
  {
    id: 'fallback-exp-impetus',
    company: 'Impetus Technologies',
    title: 'Senior Software Engineer',
    bannerImage: '',
    logo: asset('images/impetus-sq.webp'),
    date: 'Jul 2022 – Present',
    responsibilities: [
      'Build production-grade Generative AI systems — RAG pipelines and agentic LLM workflows using LangChain and LangGraph.',
      'Migrate large-scale on-prem data workloads to Google Cloud Platform (BigQuery, Dataproc, Cloud Composer).',
      'Design and ship FastAPI microservices and REST APIs that power AI-driven product features.',
    ],
    recognition: [
      'Excellence Award — Transformational Performance (2026)',
      'iAppreciate Award (2026)',
    ],
  },
  {
    id: 'fallback-exp-rgpv',
    company: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya',
    title: 'B.Tech, Computer Science & Engineering',
    bannerImage: '',
    logo: asset('images/rgpv-sq.png'),
    date: '2018 – 2022',
    responsibilities: [
      'Bachelor of Technology in Computer Science & Engineering.',
      'Foundations in data structures, algorithms, databases and distributed systems.',
    ],
    recognition: [],
  },
];

// ─── Technical skills ──────────────────────────────────────────────────────
type FallbackSkill = {
  name: string;
  logo: string;
  skill_type: string;
};

const fallbackSkillSeed: FallbackSkill[] = [
  { name: 'Generative AI', logo: 'logos/generativeai.png', skill_type: 'AI & Generative AI' },
  { name: 'LangChain', logo: 'logos/langchain.png', skill_type: 'AI & Generative AI' },
  { name: 'LangGraph', logo: 'logos/langgraph.png', skill_type: 'AI & Generative AI' },
  { name: 'Agentic AI', logo: 'logos/agenticai.png', skill_type: 'AI & Generative AI' },
  { name: 'Hugging Face', logo: 'logos/huggingface.png', skill_type: 'AI & Generative AI' },
  { name: 'Ollama', logo: 'logos/ollama.png', skill_type: 'AI & Generative AI' },
  { name: 'LangSmith', logo: 'logos/langsmith.png', skill_type: 'AI & Generative AI' },
  { name: 'MCP', logo: 'logos/mcp.png', skill_type: 'AI & Generative AI' },

  { name: 'Google Cloud', logo: 'logos/gcp.png', skill_type: 'Cloud' },
  { name: 'AWS', logo: 'logos/aws.png', skill_type: 'Cloud' },

  { name: 'Python', logo: 'logos/python.png', skill_type: 'Languages' },
  { name: 'TypeScript', logo: 'logos/typescript.png', skill_type: 'Languages' },

  { name: 'FastAPI', logo: 'logos/fastapi.png', skill_type: 'Frameworks' },
  { name: 'React', logo: 'logos/react.png', skill_type: 'Frameworks' },
  { name: 'Pydantic', logo: 'logos/pydantic.png', skill_type: 'Frameworks' },
  { name: 'REST APIs', logo: 'logos/restapis.png', skill_type: 'Frameworks' },

  { name: 'PostgreSQL', logo: 'logos/postgresql.png', skill_type: 'Databases' },
  { name: 'MySQL', logo: 'logos/mysql.png', skill_type: 'Databases' },
  { name: 'MongoDB', logo: 'logos/mongodb.png', skill_type: 'Databases' },
  { name: 'Redis', logo: 'logos/redis.png', skill_type: 'Databases' },
  { name: 'FAISS', logo: 'logos/faiss.png', skill_type: 'Databases' },
  { name: 'Chroma', logo: 'logos/chroma.png', skill_type: 'Databases' },
  { name: 'Pinecone', logo: 'logos/pinecone.png', skill_type: 'Databases' },

  { name: 'Docker', logo: 'logos/docker.png', skill_type: 'DevOps & Tools' },
  { name: 'Terraform', logo: 'logos/terraform.png', skill_type: 'DevOps & Tools' },
  { name: 'Git', logo: 'logos/git.png', skill_type: 'DevOps & Tools' },
  { name: 'uv', logo: 'logos/uv.png', skill_type: 'DevOps & Tools' },
];

export const fallbackSkills: TechnicalSkill[] = fallbackSkillSeed.map((skill, index) => ({
  id: `fallback-skill-${index}`,
  name: skill.name,
  image_url: asset(skill.logo),
  description: '',
  skill_type: skill.skill_type,
  active: true,
}));

// ─── Certificates ──────────────────────────────────────────────────────────
export const fallbackCertificates: Certificate[] = [
  {
    id: 'fallback-cert-gcp-genai-leader',
    name: 'GCP Generative AI Leader',
    organization: 'Google Cloud',
    image: asset('logos/gcp.png'),
    certificateImage: asset('logos/gcp.png'),
    issueDate: '2025',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  },
  {
    id: 'fallback-cert-hf-agents',
    name: 'Hugging Face AI Agents',
    organization: 'Hugging Face',
    image: asset('logos/huggingface.png'),
    certificateImage: asset('logos/huggingface.png'),
    issueDate: '2025',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  },
  {
    id: 'fallback-cert-genai-fundamentals',
    name: 'GenAI Fundamentals',
    organization: 'Databricks',
    image: asset('logos/generativeai.png'),
    certificateImage: asset('logos/generativeai.png'),
    issueDate: '2024',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  },
  {
    id: 'fallback-cert-associate-cloud-engineer',
    name: 'Associate Cloud Engineer',
    organization: 'Google Cloud',
    image: asset('logos/gcp.png'),
    certificateImage: asset('logos/gcp.png'),
    issueDate: '2023',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  },
];

// ─── Recognitions ──────────────────────────────────────────────────────────
export const fallbackRecognitionStats: RecognitionStat[] = [
  { label: 'Professional Certifications', value: '4+' },
  { label: 'Years Experience', value: '4+' },
  { label: 'Major Projects Completed', value: '3+' },
];

export const fallbackRecognitions: Recognition[] = [
  {
    id: 'fallback-recog-excellence',
    year: '2026',
    category: 'Impetus Technologies',
    title: 'Excellence Award — Transformational Performance',
    description:
      'Recognised for transformational impact delivering production Generative AI systems and cloud data-platform migrations.',
    image: asset('images/impetus-sq.webp'),
    tags: ['Impetus', 'Award', 'Generative AI'],
    link: '',
  },
  {
    id: 'fallback-recog-iappreciate',
    year: '2026',
    category: 'Impetus Technologies',
    title: 'iAppreciate Award',
    description:
      'Peer and leadership recognition for contribution, collaboration and technical excellence.',
    image: asset('images/impetus-sq.webp'),
    tags: ['Impetus', 'Recognition'],
    link: '',
  },
];
