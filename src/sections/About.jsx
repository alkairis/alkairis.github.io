import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCheck } from "@fortawesome/free-solid-svg-icons";

import TitleHeader from "../components/TitleHeader";
import { useAbout } from "../hooks/resources.js";
import { fallbackAbout } from "../constants/fallbacks";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const { data: about, loading } = useAbout();

  // Never leave the section empty: a null/failed response falls back to
  // bundled static content while the (possibly cold) backend wakes up.
  const profile = about ?? fallbackAbout;
  const paragraphs = profile.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  useGSAP(() => {
    const photo = sectionRef.current?.querySelector(".about-photo-panel");
    if (photo) {
      gsap.fromTo(
        photo,
        { x: -40, opacity: 0, scale: 0.96 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }

    const reveals = gsap.utils.toArray(".about-reveal", sectionRef.current);
    if (reveals.length) {
      gsap.fromTo(
        reveals,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );
    }

    const chips = gsap.utils.toArray(".about-highlight", sectionRef.current);
    if (chips.length) {
      gsap.fromTo(
        chips,
        { y: 18, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 68%" },
        }
      );
    }
  }, { scope: sectionRef, dependencies: [profile, loading] });

  return (
    <section id="about" ref={sectionRef} className="flex-center section-padding">
      <div className="about-decor" aria-hidden="true" />

      <div className="w-full h-full md:px-10 px-5 relative z-10">
        <TitleHeader title="About Me" sub="👋 Get to know me" />

        {loading ? (
          <div className="grid-12-cols mt-16 max-w-[1040px] mx-auto">
            <div className="xl:col-span-5">
              <div className="skeleton skeleton-card w-full max-w-[380px] mx-auto aspect-square rounded-3xl" />
            </div>
            <div className="xl:col-span-7 flex flex-col gap-4">
              <div className="skeleton h-7 w-2/3" />
              <div className="skeleton h-4 w-full mt-3" />
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-4 w-10/12" />
              <div className="skeleton h-4 w-full mt-3" />
              <div className="skeleton h-4 w-9/12" />
            </div>
          </div>
        ) : (
          <div className="grid-12-cols mt-16 max-w-[1040px] mx-auto items-center">
            {/* ── Photo ── */}
            <div className="xl:col-span-5 about-photo-panel">
              <div className="about-photo-frame">
                <span className="about-photo-glow" aria-hidden="true" />
                <div className="about-photo arctic-glow-card">
                  <img
                    src={profile.photo}
                    alt="Deepak Singh Rajput"
                    loading="lazy"
                  />
                </div>
                <div className="about-photo-badge">
                  <span className="about-badge-dot" aria-hidden="true" />
                  Open to opportunities
                </div>
              </div>
            </div>

            {/* ── Bio ── */}
            <div className="xl:col-span-7 about-body-panel flex flex-col gap-6">
              {profile.headline && (
                <h3 className="about-headline about-reveal">
                  {profile.headline}
                </h3>
              )}

              <div className="flex flex-col gap-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="about-bio about-reveal">
                    {para}
                  </p>
                ))}
              </div>

              {profile.location && (
                <div className="about-location about-reveal">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.highlights.length > 0 && (
                <ul className="about-highlights">
                  {profile.highlights.map((item, i) => (
                    <li key={i} className="about-highlight">
                      <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
