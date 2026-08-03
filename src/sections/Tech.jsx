import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getTechnicalSkills } from "../api/api";
import { fallbackSkills } from "../constants/fallbacks";
import TitleHeader from "../components/TitleHeader.jsx";

gsap.registerPlugin(ScrollTrigger);

const Tech = () => {
  const gridRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTechnicalSkills()
      .then((data) => {
        if (active) setSkills(data);
      })
      .catch(() => {
        if (active) setSkills([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Group by skill_type, preserving first-seen order. Fall back to a static
  // toolkit when the (possibly cold) backend returns nothing, so the section
  // is never blank.
  const groups = useMemo(() => {
    const source = skills.length ? skills : fallbackSkills;
    const map = new Map();
    for (const skill of source) {
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
  }, { scope: gridRef, dependencies: [groups, loading] });

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          sub="🤖 Expertise & Tech Stack"
          title="The Toolkit"
        />

        {loading ? (
          <div className="skill-groups mt-14">
            {Array.from({ length: 3 }).map((_, g) => (
              <div key={g} className="skill-group">
                <header className="skill-group-head">
                  <div className="skeleton h-6 w-40" />
                </header>
                <div className="skill-group-grid">
                  {Array.from({ length: 6 }).map((_, c) => (
                    <div key={c} className="skeleton skeleton-card h-[104px]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Tech;
