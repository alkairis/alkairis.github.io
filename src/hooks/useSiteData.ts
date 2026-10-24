import { useEffect, useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  useAbout,
  useAchievements,
  useCertificates,
  useExperience,
  useProjects,
  useSocialMedia,
  useTechnicalSkills,
  useYearsOfExperience,
} from "./resources";
import { useResumeUrl } from "./useResumeUrl";
import { useBlogStore } from "../stores/useBlogStore";
import {
  fallbackAbout,
  fallbackCertificates,
  fallbackExperiences,
  fallbackRecognitions,
  fallbackSkills,
} from "../constants/fallbacks";
import { fallbackLinks } from "../content/profile";
import { resolveSocialIcon, socialDisplayValue, socialHref } from "../constants/socialIcons";
import type { Experience } from "../api/api";

export type SiteLink = {
  id: string;
  label: string;
  href: string;
  display: string;
  icon: IconDefinition;
};

// The API has no "kind" field on experience entries, so education is
// recognised by its title or institution.
const EDUCATION_PATTERN =
  /\b(b\.?\s?tech|m\.?\s?tech|bachelor|master|degree|diploma|ph\.?d|university|vishwavidyalaya|college|institute|school)\b/i;

export const isEducation = (entry: Experience): boolean =>
  EDUCATION_PATTERN.test(`${entry.title} ${entry.company}`);

const isMail = (name: string, icon: string, url: string) =>
  /mail|envelope|\bat\b|faat/.test(`${name} ${icon}`.toLowerCase()) || /^mailto:|^[^/\s]+@[^/\s]+$/.test(url);

const FALLBACK_ICONS: Record<string, string> = {
  github: "faGithub",
  linkedin: "faLinkedinIn",
  medium: "faMedium",
  x: "faXTwitter",
};

/**
 * Everything the public pages render, with bundled fallbacks substituted for
 * any resource the (possibly cold) API hasn't returned yet. Each underlying
 * hook is module-cached, so calling this from several components costs one
 * request per endpoint.
 */
export const useSiteData = () => {
  const about = useAbout();
  const experience = useExperience();
  const projects = useProjects();
  const skills = useTechnicalSkills();
  const certificates = useCertificates();
  const achievements = useAchievements();
  const socials = useSocialMedia();
  const years = useYearsOfExperience();
  const resumeUrl = useResumeUrl();
  const { posts, status: blogStatus, fetchBlogs } = useBlogStore();

  useEffect(() => {
    fetchBlogs().catch(() => {
      /* the Writing section falls back to a Medium profile link */
    });
  }, [fetchBlogs]);

  const { links, email } = useMemo(() => {
    let mail: SiteLink | null = null;
    const fromApi: SiteLink[] = [];

    for (const s of socials.data) {
      const href = socialHref(s.url, `${s.name} ${s.icon}`);
      const link: SiteLink = {
        id: s.id,
        label: s.name,
        href,
        display: socialDisplayValue(s.url),
        icon: resolveSocialIcon(s.icon),
      };
      if (isMail(s.name, s.icon, s.url)) mail ??= link;
      else if (!/phone|whatsapp|call|mobile|number/i.test(`${s.name} ${s.icon}`)) fromApi.push(link);
    }

    // API entries win; fallbacks fill in any platform the API doesn't list.
    const known = new Set(fromApi.map((l) => l.label.toLowerCase().replace(/[^a-z]/g, "")));
    const fill = fallbackLinks
      .filter((f) => !known.has(f.label.toLowerCase().replace(/[^a-z]/g, "")))
      .filter((f) => !(f.id === "x" && known.has("twitter")))
      .map<SiteLink>((f) => ({
        id: `fallback-${f.id}`,
        label: f.label,
        href: f.url,
        display: socialDisplayValue(f.url),
        icon: resolveSocialIcon(FALLBACK_ICONS[f.id] ?? ""),
      }));

    return { links: [...fromApi, ...fill], email: mail as SiteLink | null };
  }, [socials.data]);

  // Memoised so consumers (the search index especially) see stable arrays.
  const { roles, education } = useMemo(() => {
    const experiences = experience.data.length ? experience.data : fallbackExperiences;
    return {
      roles: experiences.filter((e) => !isEducation(e)),
      education: experiences.filter(isEducation),
    };
  }, [experience.data]);

  return {
    about: about.data ?? fallbackAbout,
    aboutLoading: about.loading,
    roles,
    education,
    experienceLoading: experience.loading,
    projects: projects.data,
    projectsLoading: projects.loading,
    skills: skills.data.length ? skills.data : fallbackSkills,
    certificates: certificates.data.length ? certificates.data : fallbackCertificates,
    achievements: achievements.data.length ? achievements.data : fallbackRecognitions,
    years: years.data,
    resumeUrl,
    links,
    email,
    posts,
    postsLoading: blogStatus === "idle" || blogStatus === "loading",
  };
};

export type SiteData = ReturnType<typeof useSiteData>;

export const linkByLabel = (links: SiteLink[], pattern: RegExp): SiteLink | undefined =>
  links.find((l) => pattern.test(`${l.label} ${l.href}`));
