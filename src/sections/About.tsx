import BrandArt from "../components/BrandArt";
import SectionHead from "../components/SectionHead";
import { profile } from "../content/profile";
import { useSiteData } from "../hooks/useSiteData";
import { delay } from "../lib/style";

const About = () => {
  const { about } = useSiteData();
  const paragraphs = about.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="about" className="section section-alt" aria-labelledby="about-title">
      <div className="container">
        <SectionHead
          index="02"
          label="About"
          id="about-title"
          title={
            <>
              The <span className="serif">unglamorous</span> parts are the job
            </>
          }
        />

        <div className="about" data-fx="0.55">
          <figure className="about-photo">
            <BrandArt />
            <figcaption>
              <span className="live-dot" aria-hidden="true" />
              <span>
                {profile.location} · {profile.workModel}
                <span className="mono"> · {profile.timezone}</span>
              </span>
            </figcaption>
          </figure>

          <div className="about-body">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "about-lead" : undefined} data-reveal style={delay(i)}>
                {p}
              </p>
            ))}

            <p className="about-care" data-reveal style={delay(paragraphs.length)}>
              What I care about: grounding retrieval so it actually retrieves, keeping agent graphs debuggable, and
              the cost, latency and reliability work that decides whether an LLM feature survives contact with
              production.
            </p>

            {about.highlights.length > 0 && (
              <ul className="about-highlights">
                {about.highlights.map((h, i) => (
                  <li key={h} data-reveal style={delay(i)}>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
