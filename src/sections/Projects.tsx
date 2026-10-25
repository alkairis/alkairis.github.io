import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { ArrowUpRight } from "../components/Icons";
import { useSiteData } from "../hooks/useSiteData";

const usable = (url: string) => /^https?:\/\//.test(url ?? "");

/**
 * Every CMS project after the featured four, as a compact list under them.
 * Renders nothing when there are no more (including while loading — the
 * featured cards already hold the space).
 */
const Projects = () => {
  const { moreProjects: projects } = useSiteData();
  if (projects.length === 0) return null;

  return (
    <div id="projects" className="container projects">
      <div className="projects-head" data-reveal>
        <h3 className="projects-title">More projects</h3>
        <p className="mono">From the CMS · {projects.length} more</p>
      </div>

      <ul className="project-list">
        {projects.map((p) => (
          <li key={p.id} className={`project${p.image_url.length ? "" : " project--plain"}`} data-reveal>
            {p.image_url[0] && (
              <div className="project-thumb">
                <img src={p.image_url[0]} alt="" loading="lazy" />
                {p.image_url.length > 1 && (
                  <span className="project-thumb-more mono" aria-label={`${p.image_url.length} screenshots`}>
                    +{p.image_url.length - 1}
                  </span>
                )}
              </div>
            )}
            <div className="project-body">
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <div className="chips">
                {p.technologies.slice(0, 6).map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="project-links">
              {usable(p.github_url) && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faGithub} /> Code
                </a>
              )}
              {usable(p.demo_url) && (
                <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Live <ArrowUpRight />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
