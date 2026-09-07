import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { resolveSocialIcon, socialHref } from "../constants/socialIcons";
import { useResumeUrl } from "../hooks/useResumeUrl";
import { useProjects, useSocialMedia } from "../hooks/resources";
import Button from "../components/Button";
import Typing from "../components/Typing";
import "../components/hero.css";
import ExpandableIconButton from "../components/ExpandableIconButton";
import DownloadButton from "../components/DownloadButton";

// The WebGL field is code-split so the three.js chunk only loads when we
// actually use it (skipped on mobile / reduced-motion / no-WebGL).
const NoiseInstancedField = lazy(() =>
  import("../components/NoiseInstancedField")
);

const ROLES = ["Senior Software Engineer", "AI & Cloud Builder", "Open to Opportunities"];

// Cheap local WebGL probe (kept out of the field module so the lazy chunk
// stays lazy).
const canUseWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
};

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleShown, setRoleShown] = useState(true);
  const [useField, setUseField] = useState(false);
  // Backend-managed resume URL, shared across every resume CTA on the page.
  const resumeUrl = useResumeUrl();
  const { data: socials } = useSocialMedia();
  // The "View My Work" CTA scrolls to the showcase section, which doesn't
  // render when there are no projects. Keep the CTA while the request is in
  // flight (the common case is that projects exist, so hiding it first would
  // shift the layout) and drop it only once we know there are none.
  const { data: projects, loading: projectsLoading } = useProjects();
  const hasProjects = projectsLoading || projects.length > 0;

  // Decide once, client-side, whether to run the WebGL field or fall back to
  // the lightweight 2D constellation (mobile / reduced-motion / no WebGL).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    setUseField(!reduce && !small && canUseWebGL());
  }, []);

  const socialImgs = useMemo(
    () =>
      socials.map((s) => ({
        name: s.name,
        link: socialHref(s.url, `${s.name} ${s.icon}`),
        icon: resolveSocialIcon(s.icon),
      })),
    [socials]
  );

  // Role cycling with a fade. This used to write el.textContent directly into
  // a node React renders, which only worked because nothing else re-rendered
  // the hero — any future re-render would have reverted the label mid-cycle.
  // The swap is now driven by state, and the fade timeout is cleared on
  // unmount instead of being left to fire against a gone component.
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;

    const cycleRole = () => {
      setRoleShown(false);
      fadeTimer = setTimeout(() => {
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
        setRoleShown(true);
      }, 350);
    };

    const interval = setInterval(cycleRole, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <section id="hero">

      {/* Background */}
      <div className="h-bg" aria-hidden="true">
        {useField && (
          <Suspense fallback={null}>
            <NoiseInstancedField className="h-field" />
          </Suspense>
        )}
      </div>

      {/* Main content */}
      <div className="h-content">

        {/* Status badge */}
        <div className="h-badge h-in" style={{ animationDelay: "0ms" }}>
          <span className="h-dot" />
          {/* The visible label is hidden from assistive tech: a live region
              cycling every 3 seconds would interrupt a screen reader forever.
              The full list is exposed once, statically, instead. */}
          <span
            className="h-role"
            aria-hidden="true"
            style={{
              opacity: roleShown ? 1 : 0,
              transform: roleShown ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {ROLES[roleIndex]}
          </span>
          <span className="sr-only">{ROLES.join(". ")}</span>
        </div>

        {/* Name */}
        <h1 className="h-name font-audiowide h-in" style={{ animationDelay: "120ms" }}>
          <Typing titles={["Deepak Singh Rajput", "Alkairis"]} />
        </h1>

        {/* Tagline */}
        <p className="h-tagline h-in" style={{ animationDelay: "240ms" }}>
          Building{" "}
          <span className="h-accent">AI-powered systems</span>
          {" "}and scalable{" "}
          <span className="h-accent">cloud-native solutions</span>
          {" "}that drive real-world impact.
        </p>

        {/* CTAs */}
        <div className="h-ctas h-in" style={{ animationDelay: "360ms" }}>
          {/* useResumeUrl returns "" until the backend answers. Keep the CTA in
              place (hiding it would shift the hero on load) but inert, so it
              never looks clickable while there is nothing to download. */}
          <DownloadButton
            href={resumeUrl}
            text="Download CV"
            disabled={!resumeUrl}
          />
          {hasProjects && (
            <Button variant="outline" scrollTo="work">
              View My Work
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          )}
        </div>

        {/* Social icons */}
        <div className="h-socials h-in" style={{ animationDelay: "480ms" }}>
          {socialImgs.map((s) => (
            <ExpandableIconButton
              key={s.name}
              href={s.link}
              target="_blank"
              text={s.name}
              icon={s.icon}
            />
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="h-scroll h-in" style={{ animationDelay: "600ms" }} aria-hidden="true">
        <span />
      </div>
    </section>
  );
};

export default Hero;
