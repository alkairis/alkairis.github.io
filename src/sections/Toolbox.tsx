import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TechnicalSkill } from "../api/api";
import SectionHead from "../components/SectionHead";
import { SkillCard, SubTech } from "../components/SkillCard";
import { useSiteData } from "../hooks/useSiteData";
import { groupSkills, hasDetails } from "../lib/skills";
import { scatter } from "../lib/style";

const CARD_ID = "skill-card";

// A–Z, ignoring case and accents, with numbers in natural order ("S3" before "S10").
const byName = new Intl.Collator("en", { sensitivity: "base", numeric: true }).compare;

/** This section lists skills, and each skill's sub-technologies, alphabetically. */
const sortGroups = (groups: [string, TechnicalSkill[]][]): [string, TechnicalSkill[]][] =>
  groups.map(([group, items]) => [
    group,
    items
      .map((s) => ({ ...s, sub_tech: [...s.sub_tech].sort(byName) }))
      .sort((a, b) => byName(a.name, b.name)),
  ]);

type Active = { skill: TechnicalSkill; anchor: HTMLElement };

const Toolbox = () => {
  const { skills } = useSiteData();
  const groups = useMemo(() => sortGroups(groupSkills(skills)), [skills]);
  const [active, setActive] = useState<Active | null>(null);
  // Set by a touch/pen press so the focus and click that follow it act as a tap.
  const touched = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const open = (skill: TechnicalSkill, anchor: HTMLElement) => {
    clearTimeout(closeTimer.current);
    setActive({ skill, anchor });
  };
  // A short grace period so sliding between neighbouring chips doesn't flicker.
  const close = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 90);
  };

  // While a card is open: Escape closes it, and so does a tap anywhere else.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.(".chip--details")) setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [active]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const isMouse = (e: ReactPointerEvent) => e.pointerType === "mouse";

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
          aside={<p>No proficiency bars. Hover or tap any of these for what's inside, or ask me where I used it.</p>}
        />
        {/* Chips start scattered and assemble as the section scrolls in
            (--sx/--sy/--sr per chip; see .toolbox in site.css). */}
        <dl className="toolbox" data-fx="0.8">
          {groups.map(([group, items], g) => (
            <div key={group} className="toolbox-row">
              <dt className="mono">{group}</dt>
              <dd className="chips">
                {items.map((s, i) => {
                  const sub = s.sub_tech.length > 0;
                  const label = (
                    <>
                      {s.image_url && <img src={s.image_url} alt="" loading="lazy" />}
                      <span className="chip-name">{s.name}</span>
                      <SubTech items={s.sub_tech} />
                    </>
                  );
                  if (!hasDetails(s))
                    return (
                      <span key={s.id} className={`chip${sub ? " chip--sub" : ""}`} style={scatter(g * 13 + i)}>
                        {label}
                      </span>
                    );
                  const isOpen = active?.skill.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip chip--details${sub ? " chip--sub" : ""}${isOpen ? " is-active" : ""}`}
                      style={scatter(g * 13 + i)}
                      aria-describedby={isOpen ? CARD_ID : undefined}
                      onPointerDown={(e) => (touched.current = !isMouse(e))}
                      onPointerEnter={(e) => isMouse(e) && open(s, e.currentTarget)}
                      onPointerLeave={(e) => isMouse(e) && close()}
                      onFocus={(e) => !touched.current && open(s, e.currentTarget)}
                      onBlur={close}
                      onClick={(e) => {
                        // Touch and pen have no hover: a tap toggles the card.
                        if (!touched.current) return;
                        touched.current = false;
                        if (isOpen) setActive(null);
                        else open(s, e.currentTarget);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {active && <SkillCard key={active.skill.id} id={CARD_ID} skill={active.skill} anchor={active.anchor} />}
    </section>
  );
};

export default Toolbox;
