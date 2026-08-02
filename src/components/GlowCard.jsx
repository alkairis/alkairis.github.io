import { useRef } from "react";

/**
 * GlowCard — interactive card with a rotating glow border on mouse move.
 * Props:
 *  - index: used for key externally; not needed inside anymore
 *  - link: optional URL to open on click
 *  - children: card content
 */
const GlowCard = ({ link, children }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    card.style.setProperty("--start", angle + 60);
  };

  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={`card arctic-glow-card timeline-card rounded-xl p-10 mb-5 break-inside-avoid-column ${
        link ? "hover:cursor-pointer" : ""
      }`}
    >
      <div className="glow" />
      {children}
    </div>
  );
};

export default GlowCard;
