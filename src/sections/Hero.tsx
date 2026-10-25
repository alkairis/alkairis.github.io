import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AskConsole from "../components/AskConsole";
import { ArrowRight } from "../components/Icons";
import { profile } from "../content/profile";
import { linkByLabel, useSiteData } from "../hooks/useSiteData";
import { delay } from "../lib/style";

const Hero = () => {
  const { years, certificates, achievements, email, links } = useSiteData();
  const github = linkByLabel(links, /github/i);
  const linkedin = linkByLabel(links, /linkedin/i);

  const discuss = email
    ? `${email.href}?subject=${encodeURIComponent("Role conversation — via your portfolio")}`
    : "#contact";

  const proof = [
    { value: `${years}+`, label: "years shipping production AI & cloud systems" },
    { value: String(certificates.length), label: "certifications, incl. GCP Generative AI Leader" },
    { value: String(achievements.length), label: "awards & recognitions at Impetus" },
    { value: "RAG · Agents · GCP · AWS", label: "where I'm most useful", wide: true },
  ];

  return (
    <section id="top" className="hero" data-fx-out>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-status" data-reveal>
            <span className="live-dot" aria-hidden="true" />
            {profile.availability}
          </p>

          <h1 className="hero-title" data-reveal style={delay(1)}>
            Production GenAI, <span className="serif accent-text">built to hold&nbsp;up.</span>
          </h1>

          <p className="hero-lead" data-reveal style={delay(2)}>
            I'm {profile.name}, a {profile.role.toLowerCase()} at {profile.company}. I build RAG pipelines that
            actually retrieve, LangGraph agents that survive the third tool call, and the cloud data platforms
            underneath them.
          </p>

          <div className="hero-ctas" data-reveal style={delay(3)}>
            <a className="btn btn-primary" href={discuss}>
              Discuss a role <ArrowRight />
            </a>
            <Link className="btn btn-ghost" to="/resume">
              Resume
            </Link>
            <span className="hero-socials">
              {[github, linkedin].map(
                (l) =>
                  l && (
                    <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={l.label}>
                      <FontAwesomeIcon icon={l.icon} />
                    </a>
                  )
              )}
            </span>
          </div>

          <p className="hero-meta mono" data-reveal style={delay(4)}>
            {profile.location} · {profile.timezone} · {profile.credential}
          </p>
        </div>

        <div className="hero-console" data-reveal style={delay(2)}>
          <AskConsole />
        </div>
      </div>

      <div className="container">
        <ul className="proof" aria-label="At a glance">
          {proof.map((p, i) => (
            <li key={p.label} className={p.wide ? "is-wide" : undefined} data-reveal style={delay(i)}>
              <span className="proof-value">{p.value}</span>
              <span className="proof-label">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;
