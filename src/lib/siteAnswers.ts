import type { SiteData } from "../hooks/useSiteData";
import { profile } from "../content/profile";
import { groupSkills } from "./skills";

/**
 * Answers for the suggested questions (SUGGESTIONS in content/profile.ts),
 * written from the same CMS data the page renders, so they're instant, free
 * and always agree with the page. Anything else goes to the LLM.
 *
 * Keys are the questions normalised; if a suggestion's wording changes, its
 * builder here must change too, or that question simply falls through to the
 * LLM. A builder may also return null to defer to the LLM when the data has
 * nothing relevant.
 */

type Builder = (data: SiteData) => string | null;

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const firstSentence = (text: string, max = 200) => {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentence = /^.+?[.!?](?=\s|$)/.exec(clean)?.[0] ?? clean;
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}…` : sentence;
};

const joinWords = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/** "Data Engineer + AI Engineer" → "data engineer and AI engineer" (acronyms stay). */
const inSentence = (text: string) =>
  text
    .split(/\s+/)
    .map((word) => (word === "+" ? "and" : /^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()))
    .join(" ");

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

const whatHeBuilds: Builder = ({ featured }) => {
  const focus = joinWords(profile.focus.split(" · ").map(inSentence));
  const lines = [`${profile.firstName} is a ${inSentence(profile.role)}, working across ${focus}.`];
  if (featured.length) {
    lines.push(
      "",
      "Systems he's shipped:",
      bullets(featured.map((p) => `**${p.name}**: ${firstSentence(p.description)}`)),
      "",
      "More detail in [Selected work](#work).",
    );
  }
  return lines.join("\n");
};

const LANGGRAPH = /langgraph/i;

const langGraph: Builder = ({ featured, moreProjects, roles, skills }) => {
  const projects = [...featured, ...moreProjects].filter((p) =>
    LANGGRAPH.test(`${p.name} ${p.description} ${p.technologies.join(" ")}`),
  );
  const atWork = roles.flatMap((r) =>
    r.responsibilities.filter((line) => LANGGRAPH.test(line)).map((line) => `At **${r.company}**: ${firstSentence(line, 220)}`),
  );
  const skill = skills.find((s) => LANGGRAPH.test(s.name));
  if (!projects.length && !atWork.length && !skill) return null;

  const lines = [`Yes, LangGraph is a core part of how ${profile.firstName} builds agents.`];
  if (skill?.description) lines.push("", firstSentence(skill.description, 240));
  if (skill?.sub_tech.length) lines.push("", `He works with ${joinWords(skill.sub_tech)}.`);
  if (atWork.length) lines.push("", bullets(atWork.slice(0, 3)));
  if (projects.length) {
    lines.push("", "Projects that use it:", bullets(projects.slice(0, 4).map((p) => `**${p.name}**: ${firstSentence(p.description)}`)));
  }
  return lines.join("\n");
};

const openToRoles: Builder = ({ resumeUrl }) =>
  [
    `**Yes. ${profile.availability}.**`,
    "",
    bullets([
      `Location: ${profile.location}, ${profile.workModel.toLowerCase()} work`,
      // availabilityDetail ends with the overlap note, e.g. "IST overlap with EU and US mornings".
      `Time zone: ${profile.timezone} (${profile.availabilityDetail.split(" · ").pop() ?? ""})`,
    ]),
    "",
    `The quickest way to start is the [contact section](#contact)${resumeUrl ? `, or grab the [resume](${resumeUrl})` : ""}.`,
  ].join("\n");

const cloudsAndCerts: Builder = ({ skills, certificates }) => {
  const cloudGroup = groupSkills(skills).find(([group]) => /cloud/i.test(group))?.[1];
  const clouds = cloudGroup ?? skills.filter((s) => /\b(aws|gcp|google cloud|azure)\b/i.test(s.name));
  if (!clouds.length && !certificates.length) return null;

  const lines: string[] = [];
  if (clouds.length) {
    lines.push(
      "**Clouds**",
      bullets(clouds.map((s) => (s.sub_tech.length ? `**${s.name}**: ${s.sub_tech.join(", ")}` : `**${s.name}**`))),
    );
  }
  if (certificates.length) {
    if (lines.length) lines.push("");
    lines.push(
      "**Certifications**",
      bullets(
        certificates.map((c) => {
          const name = c.credentialUrl ? `[${c.name}](${c.credentialUrl})` : `**${c.name}**`;
          const meta = [c.organization, c.issueDate].filter(Boolean).join(", ");
          return meta ? `${name} (${meta})` : name;
        }),
      ),
    );
  }
  lines.push("", "Everything is listed under [Credentials](#credentials).");
  return lines.join("\n");
};

const BUILDERS: Record<string, Builder> = {
  [normalise("What does he build?")]: whatHeBuilds,
  [normalise("Experience with LangGraph agents?")]: langGraph,
  [normalise("Is he open to new roles?")]: openToRoles,
  [normalise("Which clouds and certifications?")]: cloudsAndCerts,
};

/** The site's own answer to a suggested question, or null to ask the LLM. */
export const siteAnswer = (question: string, data: SiteData): string | null =>
  BUILDERS[normalise(question)]?.(data) ?? null;
