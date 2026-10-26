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
  fallbackProjects,
  fallbackRecognitions,
  fallbackSkills,
} from "../constants/fallbacks";
import { fallbackLinks } from "../content/profile";
import { resolveSocialIcon, socialDisplayValue, socialHref } from "../constants/socialIcons";
import type { Experience, Project } from "../api/api";

export const FEATURED_COUNT = 4;

// Image values the CMS uses for "no image".
const NO_IMAGE = /^(n\/?a|none|null|undefined|nil|-+|#)$/i;
const isImage = (url: string) => url.trim() !== "" && !NO_IMAGE.test(url.trim());
const projectKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * A project's images without "NA"-style placeholders. If none are left, the
 * images of the default project with the same name; if that has none either,
 * an empty list, and the card shows its default cover.
 */
const withProjectImages = (project: Project): Project => {
  const images = project.image_url.filter(isImage);
  if (images.length) return images.length === project.image_url.length ? project : { ...project, image_url: images };
  const match = fallbackProjects.find((f) => projectKey(f.name) === projectKey(project.name));
  return { ...project, image_url: match?.image_url.filter(isImage) ?? [] };
};

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

  // The Work section shows the API's first FEATURED_COUNT active projects, in
  // the API's order; the rest are listed under "More projects".
  const { featured, moreProjects } = useMemo(() => {
    const live = projects.data.filter((p) => p.active !== false).map(withProjectImages);
    const list = live.length || projects.loading ? live : fallbackProjects;
    return { featured: list.slice(0, FEATURED_COUNT), moreProjects: list.slice(FEATURED_COUNT) };
  }, [projects.data, projects.loading]);

  return {
    about: about.data ?? fallbackAbout,
    aboutLoading: about.loading,
    roles,
    education,
    experienceLoading: experience.loading,
    featured,
    moreProjects,
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
