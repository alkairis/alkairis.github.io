import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { ArrowUpRight } from "../components/Icons";
import { useSiteData } from "../hooks/useSiteData";

const usable = (url: string) => /^https?:\/\//.test(url ?? "");

/**
 * Projects managed in the CMS, as a compact list under the case studies.
 * Renders nothing when the API has none (there's no bundled fallback list —
 * the case studies already carry the page).
 */
const Projects = () => {
  const { projects, projectsLoading } = useSiteData();
  if (!projectsLoading && projects.length === 0) return null;

  return (
    <div id="projects" className="container projects">
      <div className="projects-head" data-reveal>
        <h3 className="projects-title">More projects</h3>
        <p className="mono">From the CMS · {projectsLoading ? "loading" : `${projects.length} live`}</p>
      </div>

      {projectsLoading ? (
        <div className="project-list">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton" style={{ height: 112 }} />
          ))}
        </div>
      ) : (
        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.id} className="project" data-reveal>
              {p.image_url && (
                <div className="project-thumb">
                  <img src={p.image_url} alt="" loading="lazy" />
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
      )}
    </div>
  );
};

export default Projects;
