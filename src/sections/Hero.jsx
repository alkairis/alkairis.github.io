import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { getSocialMedia } from "../api/api";
import { resolveSocialIcon, socialHref } from "../constants/socialIcons";
import Button from "../components/Button.jsx";
import Typing from "../components/Typing.jsx";
import "../components/hero.css";
import ExpandableIconButton from "../components/ExpandableIconButton.jsx";
import DownloadButton from "../components/DownloadButton.jsx";
import { asset } from "../utils/asset";

// The WebGL field is code-split so the three.js chunk only loads when we
// actually use it (skipped on mobile / reduced-motion / no-WebGL).
const NoiseInstancedField = lazy(() =>
  import("../components/NoiseInstancedField.jsx")
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
  const roleRef = useRef(null);
  const roleIndexRef = useRef(0);
  const roleTimerRef = useRef(null);
  const [socials, setSocials] = useState([]);
  const [useField, setUseField] = useState(false);

  // Decide once, client-side, whether to run the WebGL field or fall back to
  // the lightweight 2D constellation (mobile / reduced-motion / no WebGL).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    setUseField(!reduce && !small && canUseWebGL());
  }, []);

  useEffect(() => {
    let active = true;
    getSocialMedia()
      .then((data) => {
        if (active) setSocials(data);
      })
      .catch(() => {
        if (active) setSocials([]);
      });
    return () => {
      active = false;
    };
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

  useEffect(() => {
    // Role cycling with fade
    const cycleRole = () => {
      const el = roleRef.current;
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      setTimeout(() => {
        roleIndexRef.current = (roleIndexRef.current + 1) % ROLES.length;
        el.textContent = ROLES[roleIndexRef.current];
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 350);
    };
    roleTimerRef.current = setInterval(cycleRole, 3000);

    return () => {
      clearInterval(roleTimerRef.current);
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
          <span ref={roleRef} className="h-role">{ROLES[0]}</span>
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
          <DownloadButton href={asset("/deepak_singh_rajput_resume.pdf")} text="Download CV" />
          <Button variant="outline" scrollTo="work">
            View My Work
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>

        {/* Social icons */}
        <div className="h-socials h-in" style={{ animationDelay: "480ms" }}>
          {socialImgs.map((s) => (
            <ExpandableIconButton
              key={s.name}
              variant="icon"
              href={s.link}
              target={"_blank"}
              rel="noopener noreferrer"
              aria-label={s.name}
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
