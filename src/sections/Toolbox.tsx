import { useMemo } from "react";
import SectionHead from "../components/SectionHead";
import { useSiteData } from "../hooks/useSiteData";
import { groupSkills } from "../lib/skills";
import { delay } from "../lib/style";

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
        <dl className="toolbox">
          {groups.map(([group, items], i) => (
            <div key={group} className="toolbox-row" data-reveal style={delay(i)}>
              <dt className="mono">{group}</dt>
              <dd className="chips">
                {items.map((s) => (
                  <span key={s.id} className="chip" title={s.description || undefined}>
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
