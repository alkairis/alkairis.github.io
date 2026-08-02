import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getTechnicalSkills } from "../api/api";
import TitleHeader from "../components/TitleHeader.jsx";

gsap.registerPlugin(ScrollTrigger);

const Tech = () => {
  const gridRef = useRef(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    let active = true;
    getTechnicalSkills()
      .then((data) => {
        if (active) setSkills(data);
      })
      .catch(() => {
        if (active) setSkills([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Group by skill_type, preserving first-seen order from the API.
  const groups = useMemo(() => {
    const map = new Map();
    for (const skill of skills) {
      if (!map.has(skill.skill_type)) map.set(skill.skill_type, []);
      map.get(skill.skill_type).push(skill);
    }
    return Array.from(map, ([type, items]) => ({ type, items }));
  }, [skills]);

  useGSAP(() => {
    const panels = gsap.utils.toArray(".skill-group");
    if (!panels.length) return;

    gsap.fromTo(
      panels,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 82%",
        },
      }
    );
  }, { scope: gridRef, dependencies: [groups] });

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          sub="🤖 Expertise & Tech Stack"
          title="The Toolkit"
        />

        <div ref={gridRef} className="skill-groups mt-14">
          {groups.map(({ type, items }) => (
            <div key={type} className="skill-group">
              <header className="skill-group-head">
                <h3 className="skill-group-title">{type}</h3>
                <span className="skill-group-count">{items.length}</span>
              </header>

              <div className="skill-group-grid">
                {items.map((tech) =>
                  tech.description ? (
                    <div key={tech.id} className="tech-icon-card tech-icon-card--detail">
                      <img src={tech.image_url} alt={tech.name} />
                      <div className="tech-detail-body">
                        <span className="tech-detail-name">{tech.name}</span>
                        <div className="tech-detail-chips">
                          {tech.description
                            .split(/[;,]\s*/)
                            .filter(Boolean)
                            .map((service) => (
                              <span key={service} className="tech-chip">
                                {service}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={tech.id} className="tech-icon-card">
                      <img src={tech.image_url} alt={tech.name} />
                      <span className="tech-icon-name">{tech.name}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tech;
