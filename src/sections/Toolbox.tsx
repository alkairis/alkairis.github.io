import { useMemo } from "react";
import SectionHead from "../components/SectionHead";
import { useSiteData } from "../hooks/useSiteData";
import { groupSkills } from "../lib/skills";
import { scatter } from "../lib/style";

const Toolbox = () => {
  const { skills } = useSiteData();
  const groups = useMemo(() => groupSkills(skills), [skills]);

  return (
    <section id="toolbox" className="section section-alt" aria-labelledby="toolbox-title">
      <div className="container">
        <SectionHead
          index="04"
          label="Toolbox"
          id="toolbox-title"
          title={
            <>
              What I <span className="serif">reach for</span>
            </>
          }
          aside={<p>No proficiency bars. Ask me about any of these and I'll tell you where I used it.</p>}
        />
        {/* Chips start scattered and assemble as the section scrolls in
            (--sx/--sy/--sr per chip; see .toolbox in site.css). */}
        <dl className="toolbox" data-fx="0.8">
          {groups.map(([group, items], g) => (
            <div key={group} className="toolbox-row">
              <dt className="mono">{group}</dt>
              <dd className="chips">
                {items.map((s, i) => (
                  <span key={s.id} className="chip" title={s.description || undefined} style={scatter(g * 13 + i)}>
                    {s.image_url && <img src={s.image_url} alt="" loading="lazy" />}
                    {s.name}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Toolbox;
