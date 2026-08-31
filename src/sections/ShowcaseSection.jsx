import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useProjects } from "../hooks/useProjects.js";
import TitleHeader from "../components/TitleHeader.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import AccordionGallery from "../components/AccordionGallery.jsx";

gsap.registerPlugin(ScrollTrigger);

const AppShowcase = () => {
  const sectionRef = useRef(null);

  // Shared with the hero, which needs the same list to decide whether to
  // render its "View My Work" CTA. One request serves both.
  const { projects, loading } = useProjects();
  const [activeProject, setActiveProject] = useState(null);
  const [originRect, setOriginRect] = useState(null);

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

  // Resolving changes this section's height (and drops it entirely when there
  // are no projects), which invalidates the ScrollTrigger positions cached by
  // every section below it. Same reason — and same fix — as the footer.
  useEffect(() => {
    if (!loading) ScrollTrigger.refresh();
  }, [loading]);

  // Backend responded with nothing to show: render no section at all rather
  // than a bare heading over empty space. While the (possibly cold) backend is
  // still answering we keep the section mounted with a skeleton, so the hero's
  // "View My Work" CTA always has an anchor to scroll to on first paint.
  if (!loading && projects.length === 0) return null;

  return (
    <div id="work" ref={sectionRef} className="app-showcase">
      <div className="w-full h-full md:px-10 px-5 -mt-20">
        <TitleHeader
          title="Project Portfolio"
          sub="🔧 Crafted for Scalable, Impactful Solutions 🚀"
        />

        {loading ? (
          <div className="w-full mt-10">
            {/* Matches AccordionGallery's default height so the swap to real
                content doesn't shift the page. */}
            <div className="skeleton skeleton-card w-full h-[460px]" />
          </div>
        ) : (
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