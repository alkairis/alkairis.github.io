import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCheck } from "@fortawesome/free-solid-svg-icons";

import TitleHeader from "../components/TitleHeader";
import { getAbout } from "../api/api";
import { fallbackAbout } from "../constants/fallbacks";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAbout()
      .then((data) => {
        if (active) setAbout(data);
      })
      .catch(() => {
        if (active) setAbout(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Never leave the section empty: a null/failed response falls back to
  // bundled static content while the (possibly cold) backend wakes up.
  const profile = about ?? fallbackAbout;
  const paragraphs = profile.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  useGSAP(() => {
    const photo = sectionRef.current?.querySelector(".about-photo-panel");
    const body = sectionRef.current?.querySelector(".about-body-panel");

    if (photo) {
      gsap.fromTo(
        photo,
        { x: -45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%" },
        }
      );
    }

    if (body) {
      gsap.fromTo(
        body,
        { x: 45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 82%" },
        }
      );
    }
  }, { scope: sectionRef, dependencies: [profile, loading] });

  return (
    <section id="about" ref={sectionRef} className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader title="About Me" sub="👋 Get to know me" />

        {loading ? (
          <div className="grid-12-cols mt-16 max-w-[1000px] mx-auto">
            <div className="xl:col-span-5">
              <div className="skeleton skeleton-card w-full aspect-square rounded-2xl" />
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
          <div className="grid-12-cols mt-16 max-w-[1000px] mx-auto items-center">
            {/* ── Photo ── */}
            <div className="xl:col-span-5 about-photo-panel">
              <div className="about-photo arctic-glow-card">
                <img
                  src={profile.photo}
                  alt="Deepak Singh Rajput"
                  loading="lazy"
                />
              </div>
            </div>

            {/* ── Bio ── */}
            <div className="xl:col-span-7 about-body-panel flex flex-col gap-6">
              {profile.headline && (
                <h2 className="about-headline">{profile.headline}</h2>
              )}

              <div className="flex flex-col gap-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="about-bio">
                    {para}
                  </p>
                ))}
              </div>

              {profile.location && (
                <div className="about-location">
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
