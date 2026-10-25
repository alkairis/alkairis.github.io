import { profile } from "../content/profile";
import type { SiteData } from "../hooks/useSiteData";
import type { Doc } from "./retrieval";

const join = (...parts: (string | undefined | false | null)[]) => parts.filter(Boolean).join(" ");

const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

/**
 * Turn everything the site renders into retrievable chunks. One chunk per
 * natural unit (a role, a case study, a certificate…) keeps citations precise:
 * a hit points at the exact place on the page the answer came from.
 */
export const buildCorpus = (data: SiteData): Doc[] => {
  const docs: Doc[] = [];
  const current = data.roles[0];

  docs.push({
    id: "profile",
    title: `${profile.name} — ${profile.role}`,
    source: "Profile",
    href: "#top",
    text: join(
      `${profile.name} is a ${profile.role} at ${profile.company}, based in ${profile.location}.`,
      `He works as both a data engineer and an AI engineer, with ${data.years}+ years of professional experience building cloud data platforms and production Generative AI systems.`,
      `Focus: ${profile.focus}.`,
      `${profile.credential}.`
    ),
  });

  docs.push({
    id: "availability",
    title: "Availability, hiring and contact",
    source: "Contact",
    href: "#contact",
    text: join(
      `${profile.availability}.`,
      `${profile.availabilityDetail}.`,
      `Based in ${profile.location}, working a ${profile.workModel.toLowerCase()} model, in ${profile.timezone}.`,
      data.email ? `The fastest way to reach him is email: ${data.email.display}.` : "Reach out through the contact form or LinkedIn.",
      data.resumeUrl ? "A PDF resume is available to download." : "A printable resume is on the resume page."
    ),
  });

  data.about.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((para, i) => {
      docs.push({ id: `about-${i}`, title: "About", source: "About", href: "#about", text: para });
    });

  data.featured.forEach((p) => {
    docs.push({
      id: `project-${p.id}`,
      title: p.name,
      source: "Featured project",
      // The section, not the card: on wide screens cards sit in a sideways
      // track that the page can't scroll an anchor into.
      href: "#work",
      text: join(sentence(p.description), p.technologies.length ? `Built with ${p.technologies.join(", ")}.` : ""),
    });
  });

  data.roles.forEach((role) => {
    docs.push({
      id: `role-${role.id}`,
      title: `${role.title} at ${role.company}`,
      source: "Experience",
      href: "#experience",
      text: join(
        `${role.title} at ${role.company}, ${role.date}.`,
        role === current && /present/i.test(role.date) ? "This is his current role." : "",
        ...role.responsibilities.map(sentence),
        ...role.recognition.map((r) => `Recognition: ${sentence(r)}`)
      ),
    });
  });

  data.education.forEach((edu) => {
    docs.push({
      id: `edu-${edu.id}`,
      title: `Education — ${edu.title}`,
      source: "Education",
      href: "#experience",
      text: join(`${edu.title}, ${edu.company}, ${edu.date}.`, ...edu.responsibilities.map(sentence)),
    });
  });

  const groups = new Map<string, string[]>();
  data.skills.forEach((s) => {
    const key = s.skill_type || "Other";
    const name = s.sub_tech.length ? `${s.name} (${s.sub_tech.join(", ")})` : s.name;
    groups.set(key, [...(groups.get(key) ?? []), name]);
    if (s.description) {
      docs.push({
        id: `skill-${s.id}`,
        title: s.name,
        source: "Toolbox",
        href: "#toolbox",
        text: join(
          sentence(s.description),
          s.sub_tech.length ? `Includes ${s.sub_tech.join(", ")}.` : "",
        ),
      });
    }
  });
  groups.forEach((names, group) => {
    docs.push({
      id: `skills-${group}`,
      title: `Skills — ${group}`,
      source: "Toolbox",
      href: "#toolbox",
      text: `${group} skills and tools: ${names.join(", ")}.`,
    });
  });

  data.certificates.forEach((c) => {
    docs.push({
      id: `cert-${c.id}`,
      title: c.name,
      source: "Certification",
      href: "#credentials",
      text: `${c.name} certification, issued by ${c.organization}${c.issueDate ? ` in ${c.issueDate}` : ""}.`,
    });
  });

  data.achievements.forEach((a) => {
    docs.push({
      id: `award-${a.id}`,
      title: a.title,
      source: "Award",
      href: "#credentials",
      text: join(`${a.title} award (${a.year}) from ${a.category}.`, sentence(a.description)),
    });
  });

  data.moreProjects.forEach((p) => {
    docs.push({
      id: `project-${p.id}`,
      title: p.name,
      source: "Project",
      href: "#projects",
      text: join(sentence(p.description), p.technologies.length ? `Built with ${p.technologies.join(", ")}.` : ""),
    });
  });

  data.posts.forEach((post, i) => {
    docs.push({
      id: `post-${i}`,
      title: post.title,
      source: "Writing",
      href: post.link,
      text: join(`Article on Medium: ${post.title}.`, post.tags.length ? `Topics: ${post.tags.join(", ")}.` : ""),
    });
  });

  return docs;
};
