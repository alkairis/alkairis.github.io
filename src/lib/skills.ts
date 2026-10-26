import type { TechnicalSkill } from "../api/api";

// A–Z, ignoring case and accents, with numbers in natural order ("S3" before "S10").
const byName = new Intl.Collator("en", { sensitivity: "base", numeric: true }).compare;

/**
 * Skills grouped by the CMS's skill_type. Groups keep their first-seen order;
 * within each, skills are sorted A–Z, and so is each skill's sub_tech.
 */
export const groupSkills = (skills: TechnicalSkill[]): [string, TechnicalSkill[]][] => {
  const groups = new Map<string, TechnicalSkill[]>();
  skills.forEach((s) => {
    const key = s.skill_type || "Other";
    const sorted = { ...s, sub_tech: [...s.sub_tech].sort(byName) };
    groups.set(key, [...(groups.get(key) ?? []), sorted]);
  });
  return [...groups.entries()].map(([group, items]) => [group, items.sort((a, b) => byName(a.name, b.name))]);
};

/** Whether a skill has anything to show beyond its name (Toolbox opens a card for it). */
export const hasDetails = (s: TechnicalSkill) => Boolean(s.description) || s.sub_tech.length > 0;
