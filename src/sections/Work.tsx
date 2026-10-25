import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import ProjectGallery from "../components/ProjectGallery";
import SectionHead from "../components/SectionHead";
import { ArrowDown, ArrowUpRight } from "../components/Icons";
import { FEATURED_COUNT, useSiteData } from "../hooks/useSiteData";
import type { Project } from "../api/api";
import { tone } from "../lib/style";

// Each card takes the next tone, so the four read as a set.
const TONES = ["teal", "indigo", "amber", "rose"] as const;

// Long descriptions collapse behind "Read more" past this many characters.
const CLAMP_AT = 340;

const usable = (url: string | null | undefined): url is string => /^https?:\/\//.test(url ?? "");

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Cover for a project without an image: monogram over its stack. */
const StackPlate = ({ project }: { project: Project }) => (
  <div className="plate" aria-hidden="true">
    <span className="plate-mark">{initials(project.name)}</span>
    <ul className="plate-stack mono">
      {project.technologies.slice(0, 6).map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  </div>
);

const ProjectCard = ({ project, n }: { project: Project; n: number }) => {
  const [open, setOpen] = useState(false);
  const description = project.description?.trim() ?? "";
  const long = description.length > CLAMP_AT;
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const code = usable(project.github_url) ? project.github_url : null;
  const demo = usable(project.demo_url) ? project.demo_url : null;
  const coverLink = demo ?? code;

  return (
    <article
      id={`project-${project.id}`}
      className="case"
      style={tone(TONES[(n - 1) % TONES.length] ?? "teal")}
      data-fx="0.6"
    >
      <div className="case-grid">
        <div className="case-copy">
          <p className="case-meta mono">
            <span className="case-n">{String(n).padStart(2, "0")}</span>
            <span>Featured project</span>
            {project.technologies[0] && (
              <>
                <span className="case-dot" aria-hidden="true" />
                <span>{project.technologies.slice(0, 2).join(" · ")}</span>
              </>
            )}
          </p>
          <h3 className="case-title">{project.name}</h3>

          <div id={`project-${project.id}-desc`} className={`case-desc${long && !open ? " is-clamped" : ""}`}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {project.technologies.length > 0 && (
            <div className="chips case-chips">
              {project.technologies.map((t) => (
                <span key={t} className="chip chip-accent">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="case-actions">
            {long && (
              <button
                type="button"
                className="link-u case-toggle"
                aria-expanded={open}
                aria-controls={`project-${project.id}-desc`}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? "Show less" : "Read more"}
                <ArrowDown className="case-toggle-icon" />
              </button>
            )}
            {code && (
              <a href={code} target="_blank" rel="noopener noreferrer" className="link-u arrow-link">
                <FontAwesomeIcon icon={faGithub} /> View code
              </a>
            )}
            {demo && (
              <a href={demo} target="_blank" rel="noopener noreferrer" className="link-u arrow-link">
                Live demo <ArrowUpRight />
              </a>
            )}
          </div>
        </div>

        <figure className="case-figure">
          <div className="case-cover">
            <ProjectGallery
              images={project.image_url}
              name={project.name}
              href={coverLink}
              fallback={<StackPlate project={project} />}
            />
          </div>
        </figure>
      </div>
    </article>
  );
};

const Work = () => {
  const { featured, projectsLoading } = useSiteData();

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="container">
        <SectionHead
          index="01"
          label="Selected work"
          id="work-title"
          title={
            <>
              Systems I've <span className="serif">shipped</span>
            </>
          }
          aside={<p>The {FEATURED_COUNT} projects I'd most like to talk about, straight from my CMS.</p>}
        />
      </div>

      {/* On wide screens this pins and the cards slide sideways as you scroll
          (see useScrollFx); elsewhere it's a plain vertical stack. */}
      <div className="hs" data-hscroll>
        <div className="hs-stage">
          <div className="hs-track">
            {projectsLoading && featured.length === 0
              ? Array.from({ length: FEATURED_COUNT }, (_, i) => (
                  <div key={i} className="skeleton case-skeleton" />
                ))
              : featured.map((project, i) => <ProjectCard key={project.id} project={project} n={i + 1} />)}
          </div>
          <div className="hs-ui container" aria-hidden="true">
            <span className="hs-bar">
              <i />
            </span>
            <span className="hs-hint mono">Scroll to browse →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
