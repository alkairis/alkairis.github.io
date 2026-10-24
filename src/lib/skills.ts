import type { TechnicalSkill } from "../api/api";

/** Skills grouped by the CMS's skill_type, in first-seen order. */
export const groupSkills = (skills: TechnicalSkill[]): [string, TechnicalSkill[]][] => {
  const groups = new Map<string, TechnicalSkill[]>();
  skills.forEach((s) => {
    const key = s.skill_type || "Other";
    groups.set(key, [...(groups.get(key) ?? []), s]);
  });
  return [...groups.entries()];
};
