import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { TechnicalSkill } from "../api/api";

const INLINE_LIMIT = 3; // sub-technologies shown on the chip itself; the card lists them all
const GAP = 12; // chip ↔ card
const EDGE = 12; // card ↔ viewport edge
const NAV = 76; // keep clear of the sticky nav when deciding to open upwards

/** The "LCEL · LangServe · Retrievers +2" tail on a skill chip. */
export const SubTech = ({ items, limit = INLINE_LIMIT }: { items: string[]; limit?: number }) => {
  if (!items.length) return null;
  const rest = items.length - limit;
  return (
    <span className="chip-sub">
      {items.slice(0, limit).map((t) => (
        <span key={t}>{t}</span>
      ))}
      {rest > 0 && <span className="chip-sub-more">+{rest}</span>}
    </span>
  );
};

type Placement = { x: number; y: number; arrow: number; side: "top" | "bottom" };

/**
 * Floating card for one skill: logo, name, group, description and every
 * sub-technology. Rendered into <body> with fixed positioning so the chips'
 * scroll transforms and #toolbox's overflow clip can't affect it; it opens
 * above its chip when there's room, otherwise below, and follows the chip
 * while the page scrolls.
 */
export const SkillCard = ({ id, skill, anchor }: { id: string; skill: TechnicalSkill; anchor: HTMLElement }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [place, setPlace] = useState<Placement | null>(null);

  const measure = useCallback(() => {
    const card = ref.current;
    if (!card) return;
    const r = anchor.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const above = r.top - h - GAP >= NAV;
    const cx = r.left + r.width / 2;
    const x = Math.min(Math.max(cx - w / 2, EDGE), vw - w - EDGE);
    setPlace({
      x,
      y: above ? r.top - h - GAP : r.bottom + GAP,
      // Arrow stays on the chip even when the card is pushed off-centre.
      arrow: Math.min(Math.max(cx - x, 18), w - 18),
      side: above ? "top" : "bottom",
    });
  }, [anchor]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    let frame = 0;
    const follow = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, [measure]);

  const style = place
    ? ({ left: place.x, top: place.y, "--arrow": `${place.arrow}px` } as CSSProperties)
    : undefined;

  return createPortal(
    <div
      ref={ref}
      id={id}
      role="tooltip"
      className={`skill-card${place ? " is-open" : ""}`}
      data-side={place?.side}
      style={style}
    >
      <div className="skill-card-head">
        {skill.image_url && (
          <span className="skill-card-logo" aria-hidden="true">
            <img src={skill.image_url} alt="" />
          </span>
        )}
        <span className="skill-card-title">
          <strong>{skill.name}</strong>
          {skill.skill_type && <span className="mono">{skill.skill_type}</span>}
        </span>
      </div>
      {skill.description && <p>{skill.description}</p>}
      {skill.sub_tech.length > 0 && (
        <div className="skill-card-sub">
          <span className="mono">Includes · {skill.sub_tech.length}</span>
          <ul>
            {skill.sub_tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>,
    document.body,
  );
};
