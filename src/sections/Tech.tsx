import { useMemo } from "react";
import { useTechnicalSkills } from "../hooks/resources";
import type { TechnicalSkill } from "../api/api";
import { fallbackSkills } from "../constants/fallbacks";
import TitleHeader from "../components/TitleHeader";

const Tech = () => {
  const { data: skills, loading } = useTechnicalSkills();

  // Group by skill_type, preserving first-seen order. Fall back to a static
  // toolkit when the (possibly cold) backend returns nothing, so the section
  // is never blank.
  const groups = useMemo(() => {
    const source = skills.length ? skills : fallbackSkills;
    const map = new Map<string, TechnicalSkill[]>();
    for (const skill of source) {
      const group = map.get(skill.skill_type);
      if (group) group.push(skill);
      else map.set(skill.skill_type, [skill]);
    }
    return Array.from(map, ([type, items]) => ({ type, items }));
  }, [skills]);

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
        <div className="skill-groups mt-14 reveal-stagger">
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
