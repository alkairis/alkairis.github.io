import { Link } from "react-router-dom";
import SectionHead from "../components/SectionHead";
import { ArrowRight } from "../components/Icons";
import { useSiteData } from "../hooks/useSiteData";
import type { Experience } from "../api/api";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const Logo = ({ entry }: { entry: Experience }) => (
  <span className="role-logo" aria-hidden="true">
    {entry.logo ? <img src={entry.logo} alt="" loading="lazy" /> : initials(entry.company)}
  </span>
);

const Journey = () => {
  const { roles, education, experienceLoading } = useSiteData();

  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <SectionHead
          index="03"
          label="Experience"
          id="experience-title"
          title={
            <>
              Where I've <span className="serif">done it</span>
            </>
          }
          aside={
            <Link to="/resume" className="link-u arrow-link">
              Full resume <ArrowRight />
            </Link>
          }
        />

        {experienceLoading && roles.length === 0 ? (
          <div className="skeleton" style={{ height: 180 }} />
        ) : (
          <ol className="roles">
            {roles.map((r) => (
              <li key={r.id} className="role" data-reveal>
                <p className="role-date mono">{r.date}</p>
                <div className="role-main">
                  <div className="role-head">
                    <Logo entry={r} />
                    <div>
                      <h3>{r.title}</h3>
                      <p className="role-company">
                        {r.company}
                        {/present/i.test(r.date) && !/contractor/i.test(r.roleType) && (
                          <span className="role-now mono">Current</span>
                        )}
                        {r.roleType && <span className="role-now mono">{r.roleType}</span>}
                      </p>
                    </div>
                  </div>
                  {r.responsibilities.length > 0 && (
                    <ul className="role-points">
                      {r.responsibilities.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {r.recognition.length > 0 && (
                    <div className="chips role-awards">
                      {r.recognition.map((a) => (
                        <span key={a} className="chip chip-accent">
                          ★ {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {education.length > 0 && (
          <div className="edu" data-reveal>
            <p className="eyebrow">Education</p>
            <ul>
              {education.map((e) => (
                <li key={e.id}>
                  <Logo entry={e} />
                  <span>
                    <strong>{e.title}</strong>
                    <span className="edu-school">{e.company}</span>
                  </span>
                  <span className="mono edu-date">{e.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Journey;
