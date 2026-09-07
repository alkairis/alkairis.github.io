import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCheck } from "@fortawesome/free-solid-svg-icons";

import TitleHeader from "../components/TitleHeader";
import { useAbout } from "../hooks/resources";
import { fallbackAbout } from "../constants/fallbacks";

const About = () => {
  const { data: about, loading } = useAbout();

  // Never leave the section empty: a null/failed response falls back to
  // bundled static content while the (possibly cold) backend wakes up.
  const profile = about ?? fallbackAbout;
  const paragraphs = profile.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="about" className="flex-center section-padding">
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
            <div className="xl:col-span-5 about-photo-panel reveal-left">
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
            <div className="xl:col-span-7 about-body-panel flex flex-col gap-6 reveal-right">
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
                <ul className="about-highlights reveal-stagger reveal-stagger-pop">
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
