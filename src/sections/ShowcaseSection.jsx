import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getProjects } from "../api/api";
import TitleHeader from "../components/TitleHeader.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import AccordionGallery from "../components/AccordionGallery.jsx";

gsap.registerPlugin(ScrollTrigger);

const AppShowcase = () => {
  const sectionRef = useRef(null);

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

  const openProject = (project, rect) => {
    setOriginRect(rect);
    setActiveProject(project);
  };

  // Feed the accordion a lightweight view of each project: a cover image and a
  // caption. No `link` is passed, so clicks flow through onItemClick to open the
  // modal instead of navigating away.
  const galleryItems = projects.map((project) => ({
    image: project.image_url,
    label: project.name,
    alt: project.name,
  }));

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
  }, { scope: sectionRef, dependencies: [projects] });

  return (
    <div id="work" ref={sectionRef} className="app-showcase">
      <div className="w-full h-full md:px-10 px-5 -mt-20">
        <TitleHeader
          title="Project Portfolio"
          sub="🔧 Crafted for Scalable, Impactful Solutions 🚀"
        />

        {projects.length > 0 && (
          <div className="w-full mt-10">
            <AccordionGallery
              items={galleryItems}
              defaultIndex={Math.min(2, projects.length - 1)}
              expandRatio={0.52}
              trigger="hover"
              accentColor="#0ea5e9"
              overlayColor="#0f172a"
              textColor="#ffffff"
              tintColor="#0ea5e9"
              tilt={0}
              gap={8}
              onItemClick={(_item, index, event) =>
                openProject(
                  projects[index],
                  event.currentTarget.getBoundingClientRect()
                )
              }
            />
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
