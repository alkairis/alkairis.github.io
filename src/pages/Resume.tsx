import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Printer } from "../components/Icons";
import { caseStudies } from "../content/caseStudies";
import { profile } from "../content/profile";
import { useSiteData } from "../hooks/useSiteData";
import { groupSkills } from "../lib/skills";
import "../styles/resume.css";

/**
 * The resume as a web page, rendered from the same CMS data as the home page,
 * with a print stylesheet that turns it into a clean one-or-two-page A4 PDF.
 */
const Resume = () => {
  const { about, roles, education, skills, certificates, achievements, links, email, resumeUrl, years } =
    useSiteData();
  const groups = useMemo(() => groupSkills(skills), [skills]);
  const summary = about.bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  useEffect(() => {
    window.scrollTo(0, 0);
    const previous = document.title;
    document.title = `Resume — ${profile.name}`;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="resume-page">
      <div className="container resume-toolbar">
        <Link to="/" className="link-u">
          ← Portfolio
        </Link>
        <div className="resume-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
            <Printer /> Print / save as PDF
          </button>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" download>
              <Download /> Download PDF
            </a>
          )}
        </div>
      </div>

      <article className="resume" aria-label={`Resume of ${profile.name}`}>
        <header className="resume-head">
          <div>
            <h1>{profile.name}</h1>
            <p className="resume-role">
              {profile.role} · {profile.focus}
            </p>
          </div>
          <ul className="resume-contact mono">
            {email && (
              <li>
                <a href={email.href}>{email.display}</a>
              </li>
            )}
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.display}
                </a>
              </li>
            ))}
            <li>
              {profile.location} · {profile.timezone}
            </li>
          </ul>
        </header>

        <section className="resume-block">
          <h2>Summary</h2>
          <div className="resume-summary">
            {(summary.length ? summary : [`${years}+ years building production GenAI and cloud systems.`]).map(
              (p, i) => (
                <p key={i}>{p}</p>
              )
            )}
          </div>
        </section>

        <section className="resume-block">
          <h2>Experience</h2>
          {roles.map((r) => (
            <div key={r.id} className="resume-item">
              <div className="resume-item-head">
                <h3>
                  {r.title} <span>· {r.company}</span>
                </h3>
                <span className="mono">{r.date}</span>
              </div>
              <ul>
                {r.responsibilities.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {r.recognition.length > 0 && <p className="resume-note">Recognition: {r.recognition.join(" · ")}</p>}
            </div>
          ))}
        </section>

        <section className="resume-block">
          <h2>Selected work</h2>
          {caseStudies.map((cs) => (
            <div key={cs.slug} className="resume-item">
              <div className="resume-item-head">
                <h3>{cs.title}</h3>
                <span className="mono">{cs.client}</span>
              </div>
              <p>{cs.summary}</p>
              <p className="resume-note">{cs.stack.join(" · ")}</p>
            </div>
          ))}
        </section>

        <section className="resume-block">
          <h2>Skills</h2>
          <dl className="resume-skills">
            {groups.map(([group, items]) => (
              <div key={group}>
                <dt>{group}</dt>
                <dd>{items.map((s) => s.name).join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="resume-cols">
          <section className="resume-block">
            <h2>Certifications</h2>
            <ul className="resume-list">
              {certificates.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> — {c.organization}
                  {c.issueDate && <span className="mono"> · {c.issueDate}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="resume-block">
            <h2>Awards</h2>
            <ul className="resume-list">
              {achievements.map((a) => (
                <li key={a.id}>
                  <strong>{a.title}</strong> — {a.category}
                  {a.year && <span className="mono"> · {a.year}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {education.length > 0 && (
          <section className="resume-block">
            <h2>Education</h2>
            {education.map((e) => (
              <div key={e.id} className="resume-item resume-item--tight">
                <div className="resume-item-head">
                  <h3>
                    {e.title} <span>· {e.company}</span>
                  </h3>
                  <span className="mono">{e.date}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        <p className="resume-foot mono">
          Live version with case studies and architecture diagrams: alkairis.github.io
        </p>
      </article>

      <div className="container resume-cta">
        <Link to="/#contact" className="btn btn-primary">
          Get in touch <ArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default Resume;
