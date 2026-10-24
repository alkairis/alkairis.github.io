import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Award,
  ArrowUpRight,
  Badge,
  Briefcase,
  Download,
  GradCap,
  Layers,
  Mail,
  MapPin,
  Printer,
  Sparkle,
} from "../components/Icons";
import Contact from "../sections/Contact";
import Footer from "../sections/Footer";
import { caseStudies } from "../content/caseStudies";
import { profile } from "../content/profile";
import { useSiteData } from "../hooks/useSiteData";
import { groupSkills } from "../lib/skills";
import { delay } from "../lib/style";
import "../styles/resume.css";

const Block = ({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) => (
  <section className="rs-block" aria-labelledby={`rs-${id}`}>
    <h2 id={`rs-${id}`} className="rs-head" data-reveal>
      <span className="rs-head-icon" aria-hidden="true">
        {icon}
      </span>
      {title}
    </h2>
    {children}
  </section>
);

/**
 * The resume as a readable web page, rendered from the same CMS data as the
 * home page: a big header with contacts and a PDF download, then icon-headed
 * sections. The print stylesheet turns the same markup into an A4 document.
 */
const Resume = () => {
  const { about, roles, education, skills, certificates, achievements, links, email, resumeUrl, years } =
    useSiteData();
  const groups = useMemo(() => groupSkills(skills), [skills]);
  const summary = about.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  useEffect(() => {
    window.scrollTo(0, 0);
    const previous = document.title;
    document.title = `Resume — ${profile.name}`;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <>
      <article className="container rs" aria-label={`Resume of ${profile.name}`}>
        <Link to="/" className="rs-back">
          <span aria-hidden="true">←</span> Back to portfolio
        </Link>

        <header className="rs-header">
          <p className="eyebrow" data-reveal>
            Resume
          </p>
          <h1 className="rs-name" data-reveal style={delay(1)}>
            {profile.name}
          </h1>
          <p className="rs-role" data-reveal style={delay(2)}>
            <strong>{profile.role} · Generative AI</strong>
            <span className="rs-role-sep" aria-hidden="true">
              {" "}
              ·{" "}
            </span>
            <span>RAG pipelines, agentic systems, and the cloud data platforms underneath them.</span>
          </p>

          <div className="rs-summary" data-reveal style={delay(3)}>
            {(summary.length
              ? summary
              : [`${years}+ years building production Generative AI and cloud systems.`]
            ).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <ul className="rs-contacts" data-reveal style={delay(4)}>
            {email && (
              <li>
                <a href={email.href}>
                  <Mail /> {email.display}
                </a>
              </li>
            )}
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={l.icon} /> {l.display}
                </a>
              </li>
            ))}
            <li>
              <span>
                <MapPin /> {profile.location} · Remote
              </span>
            </li>
          </ul>

          <div className="rs-actions" data-reveal style={delay(5)}>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" download>
                <Download /> Download PDF
              </a>
            )}
            <button
              type="button"
              className={`btn ${resumeUrl ? "btn-ghost" : "btn-primary"}`}
              onClick={() => window.print()}
            >
              <Printer /> {resumeUrl ? "Print this page" : "Save as PDF"}
            </button>
          </div>
        </header>

        <Block id="experience" icon={<Briefcase />} title="Work experience">
          <ol className="rs-list">
            {roles.map((r) => (
              <li key={r.id} className="rs-item" data-reveal>
                <h3>{r.title}</h3>
                <p className="rs-org">
                  {r.company}
                  {/present/i.test(r.date) && <span className="role-now mono">Current</span>}
                </p>
                <p className="rs-meta mono">
                  <strong>{r.date}</strong>
                  <span aria-hidden="true"> · </span>
                  {profile.location}
                </p>
                {r.responsibilities.length > 0 && (
                  <ul className="rs-bullets">
                    {r.responsibilities.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                {r.recognition.length > 0 && (
                  <div className="chips rs-chips role-awards">
                    {r.recognition.map((a) => (
                      <span key={a} className="chip chip-accent">
                        ★ {a}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Block>

        <Block id="work" icon={<Layers />} title="Selected work">
          <ol className="rs-list">
            {caseStudies.map((cs) => (
              <li key={cs.slug} className="rs-item" data-reveal>
                <h3>{cs.title}</h3>
                <p className="rs-org">
                  {cs.client} · <strong>{cs.role}</strong>
                </p>
                <p className="rs-text">{cs.summary}</p>
                <div className="chips rs-chips">
                  {cs.stack.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
                <Link to={`/#case-${cs.slug}`} className="link-u arrow-link rs-more">
                  Case study &amp; architecture <ArrowUpRight />
                </Link>
              </li>
            ))}
          </ol>
        </Block>

        {education.length > 0 && (
          <Block id="education" icon={<GradCap />} title="Education">
            <ol className="rs-list">
              {education.map((e) => (
                <li key={e.id} className="rs-item" data-reveal>
                  <h3>{e.title}</h3>
                  <p className="rs-org">{e.company}</p>
                  <p className="rs-meta mono">
                    <strong>{e.date}</strong>
                  </p>
                  {e.responsibilities.length > 0 && (
                    <ul className="rs-bullets">
                      {e.responsibilities.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </Block>
        )}

        <Block id="skills" icon={<Sparkle />} title="Skills & tools">
          <dl className="rs-skills">
            {groups.map(([group, items]) => (
              <div key={group} data-reveal>
                <dt>{group}</dt>
                <dd className="chips">
                  {items.map((s) => (
                    <span key={s.id} className="chip">
                      {s.image_url && <img src={s.image_url} alt="" loading="lazy" />}
                      {s.name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block id="certifications" icon={<Badge />} title="Certifications">
          <ol className="rs-list">
            {certificates.map((c) => (
              <li key={c.id} className="rs-item rs-item--row" data-reveal>
                <div>
                  <h3>{c.name}</h3>
                  <p className="rs-org">
                    {c.organization}
                    {c.issueDate && <span className="mono rs-date"> · {c.issueDate}</span>}
                  </p>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="link-u arrow-link">
                    Verify <ArrowUpRight />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </Block>

        <Block id="awards" icon={<Award />} title="Awards & recognition">
          <ol className="rs-list">
            {achievements.map((a) => (
              <li key={a.id} className="rs-item" data-reveal>
                <h3>{a.title}</h3>
                <p className="rs-org">
                  {a.category}
                  {a.year && <span className="mono rs-date"> · {a.year}</span>}
                </p>
                {a.description && <p className="rs-text">{a.description}</p>}
              </li>
            ))}
          </ol>
        </Block>

        <p className="rs-print-foot mono">
          Live version with case studies and architecture diagrams: alkairis.github.io
        </p>
      </article>

      <div className="container rs-hire-wrap">
        <Contact variant="card" />
      </div>
      <Footer />
    </>
  );
};

export default Resume;
