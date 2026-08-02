import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getProjects } from "../api/api";
import TitleHeader from "../components/TitleHeader.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

gsap.registerPlugin(ScrollTrigger);

// Soft backdrops rotated across the list cards so the smaller projects keep the
// original design's varied look — the API `GetProjects` schema has no colour.
const LIST_CARD_BACKGROUNDS = ["#FFEFDB", "#FFE7EB", "#E7F0FF", "#E9FBEF"];

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const firstCardRef = useRef(null);
  const listRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [originRect, setOriginRect] = useState(null);

  // Pull every project (name, description, links, tech, image) from the API.
  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch(() => {
        if (active) setProjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const openProject = (project, e) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setActiveProject(project);
  };

  // Make a card open its modal on click and on Enter/Space (keyboard a11y),
  // without changing the existing layout. Note: no `className` here — it must
  // not override each card's existing layout classes.
  const cardProps = (project) => ({
    role: "button",
    tabIndex: 0,
    "aria-haspopup": "dialog",
    "aria-label": `View details for ${project.name}`,
    onClick: (e) => openProject(project, e),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProject(project, e);
      }
    },
  });

  const [featured, ...rest] = projects;

  useGSAP(() => {
    // Fade in section on scroll.
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      }
    );

    const cards = [firstCardRef.current, ...gsap.utils.toArray(".project")].filter(
      Boolean
    );

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 55, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          delay: 0.12 * index,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });
  }, { scope: sectionRef, dependencies: [projects] });

  return (
    <div id="work" ref={sectionRef} className="app-showcase">
      <div className="w-full h-full md:px-10 px-5 -mt-20">
        <TitleHeader
          title="Project Portfolio"
          sub="🔧 Crafted for Scalable, Impactful Solutions 🚀"
        />

        {projects.length > 0 && (
          <div className="w-full mt-5">
            <div className="showcaselayout">
              {featured && (
                <div
                  ref={firstCardRef}
                  className="first-project-wrapper cursor-pointer"
                  {...cardProps(featured)}
                >
                  <div className="image-wrapper">
                    <img src={featured.image_url} alt={featured.name} />
                  </div>
                  <div className="text-content">
                    <h2>{featured.name}</h2>
                    <p className="text-white-50 md:text-xl">
                      {featured.description}
                    </p>
                  </div>
                </div>
              )}

              {rest.length > 0 && (
                <div ref={listRef} className="project-list-wrapper overflow-hidden">
                  {rest.map((project, index) => (
                    <div
                      key={project.id}
                      className="project cursor-pointer"
                      {...cardProps(project)}
                    >
                      <div
                        className="image-wrapper"
                        style={{
                          backgroundColor:
                            LIST_CARD_BACKGROUNDS[
                              index % LIST_CARD_BACKGROUNDS.length
                            ],
                        }}
                      >
                        <img src={project.image_url} alt={project.name} />
                      </div>
                      <h2>{project.name}</h2>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ProjectModal
        project={activeProject}
        originRect={originRect}
        onClose={() => setActiveProject(null)}
        animationVariant="scale-morph"
        animationSpeed="normal"
        closeOnEscape
        closeOnBackdrop
        showCloseButton
      />
    </div>
  );
};

export default AppShowcase;
