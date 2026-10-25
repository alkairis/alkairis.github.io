// Facts about the person behind the site that the CMS doesn't model: the
// headline copy, availability and the canonical public profile links.
//
// Anything the CMS *does* model (bio, roles, projects, skills, certificates,
// awards, social links, resume) still comes from the API — this file only
// fills the gaps and provides first-paint values while a cold backend wakes.

export const profile = {
  name: "Deepak Singh Rajput",
  firstName: "Deepak",
  handle: "alkairis",
  role: "Data Engineer + AI Engineer",
  focus: "Data engineering · Generative AI · RAG · Agentic systems",
  company: "Impetus Technologies",
  location: "India",
  workModel: "Hybrid",
  timezone: "IST · UTC+5:30",
  availability: "Open to senior data & AI engineering roles",
  availabilityDetail: "Based in India · hybrid work · IST overlap with EU and US mornings",
  /** Headline credential, shown wherever there's room for exactly one. */
  credential: "GCP Generative AI Leader certified",
  repoUrl: "https://github.com/alkairis/alkairis.github.io",
} as const;

export type ProfileLink = {
  id: string;
  label: string;
  url: string;
};

/**
 * Public profiles, used until the social-media API answers and for any
 * platform it doesn't list. Email is deliberately absent: it is only ever
 * shown when the CMS provides it.
 */
export const fallbackLinks: ProfileLink[] = [
  { id: "github", label: "GitHub", url: "https://github.com/alkairis" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/alkairis/" },
  { id: "medium", label: "Medium", url: "https://alkairis.medium.com" },
  { id: "x", label: "X", url: "https://x.com/alkairis_" },
];

/** Recruiter-style questions the hero console demos and the ghost suggests. */
export const SUGGESTIONS = [
  "What does he build?",
  "Experience with LangGraph agents?",
  "Is he open to new roles?",
  "Which clouds and certifications?",
];
