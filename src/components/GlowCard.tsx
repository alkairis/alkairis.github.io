import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

type GlowCardProps = {
  /** When set the card becomes a link that opens in a new tab. */
  link?: string;
  children?: ReactNode;
};

/**
 * Interactive card with a glow border that rotates to follow the pointer.
 *
 * Renders an <a> when `link` is set and a plain <div> otherwise. It used to be
 * a <div onClick={window.open}> in both cases, which meant the linked variant
 * was unreachable by keyboard, had no focus ring, and was announced as generic
 * content rather than as a link. Using the real element restores all three for
 * free — there is no keyboard handler here because <a> already has one.
 */
const GlowCard = ({ link, children }: GlowCardProps) => {
  const cardRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    card.style.setProperty("--start", String(angle + 60));
  };

  const className =
    "card arctic-glow-card timeline-card rounded-xl p-10 mb-5 break-inside-avoid-column";

  if (link) {
    return (
      <a
        ref={(node) => {
          cardRef.current = node;
        }}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouseMove}
        className={`${className} block no-underline hover:cursor-pointer`}
      >
        <div className="glow" />
        {children}
      </a>
    );
  }

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      className={className}
    >
      <div className="glow" />
      {children}
    </div>
  );
};

export default GlowCard;
