import { useRef } from "react";
import { useEyeTracking } from "../hooks/useEyeTracking";
import { useAssistantStore } from "../stores/useAssistantStore";
import { GHOST_BODY } from "./GhostMark";

// Centre of the orbit and the ghost, in the 400 × 500 artboard.
const CX = 200;
const CY = 232;

/**
 * The site's logo (public/logo.svg) as a full portrait panel for About: the
 * ghost on jet black lit with amethyst, inside a slowly turning cyan orbit
 * with its data packet. The eyes follow the cursor like the floating ghost's,
 * and pressing it opens the same AI menu.
 */
const BrandArt = () => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const openMenu = useAssistantStore((s) => s.openMenu);
  // eyeLine: the ghost's eyes sit about 47% of the way down the panel.
  useEyeTracking(ref, { reach: 5, tilt: 5, eyeLine: 0.47 });

  return (
    <button
      ref={ref}
      type="button"
      className="brand-art"
      onClick={() => openMenu()}
      aria-label="Ask the ghost about Deepak"
    >
      <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="ba-bg" cx="30%" cy="22%" r="95%">
            <stop offset="0" stopColor="#5A1AA6" />
            <stop offset=".36" stopColor="#2A0750" />
            <stop offset=".72" stopColor="#0B0412" />
            <stop offset="1" stopColor="#050505" />
          </radialGradient>
          <radialGradient id="ba-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#00E5FF" stopOpacity=".26" />
            <stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ba-fade" cx="50%" cy="46%" r="60%">
            <stop offset=".35" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <pattern id="ba-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#B794F6" fillOpacity=".22" />
          </pattern>
          <mask id="ba-dots-mask">
            <rect width="400" height="500" fill="url(#ba-fade)" />
          </mask>
          <filter id="ba-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="ba-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <rect width="400" height="500" fill="url(#ba-bg)" />
        <rect width="400" height="500" fill="url(#ba-dots)" mask="url(#ba-dots-mask)" />
        <circle cx={CX} cy={CY} r="160" fill="url(#ba-halo)" />

        {/* Outer orbit with the data packet, turning slowly. */}
        <g className="ba-orbit">
          <circle
            cx={CX}
            cy={CY}
            r="142"
            fill="none"
            stroke="#00E5FF"
            strokeOpacity=".55"
            strokeWidth="4"
            strokeDasharray="2 17"
            strokeLinecap="round"
          />
          <circle cx={CX + 100} cy={CY - 100} r="13" fill="#00E5FF" filter="url(#ba-glow)" opacity=".9" />
          <circle cx={CX + 100} cy={CY - 100} r="7.5" fill="#E8FDFF" />
        </g>
        {/* Inner amethyst ring, turning the other way. */}
        <g className="ba-orbit ba-orbit--inner">
          <circle cx={CX} cy={CY} r="112" fill="none" stroke="#B794F6" strokeOpacity=".28" strokeWidth="1.5" strokeDasharray="40 14" />
          <circle cx={CX - 112} cy={CY} r="4" fill="#B794F6" />
        </g>

        {/* Ghost: shadow, then the bobbing body with tracking eyes. */}
        <ellipse className="ba-shadow" cx={CX} cy={CY + 150} rx="62" ry="9" fill="#000" opacity=".45" filter="url(#ba-soft)" />
        <g transform={`translate(${CX - 128} ${CY - 128}) scale(4)`}>
          <g className="ba-ghost">
            <g className="ghost-svg">
              <path d={GHOST_BODY} fill="#F4F1FA" />
              <g className="ghost-eyes">
                <ellipse cx="24" cy="33" rx="3.4" ry="4.2" />
                <ellipse cx="40" cy="33" rx="3.4" ry="4.2" />
              </g>
            </g>
          </g>
        </g>

        {/* Sparkle and a small ring, as on the favicon. */}
        <path className="ba-spark" d="M66 92H94M80 78V106" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" />
        <circle cx="330" cy="400" r="8" fill="none" stroke="#B794F6" strokeWidth="4" />
      </svg>

      <span className="brand-art-cta mono" aria-hidden="true">
        <span className="brand-art-dot" /> Ask the ghost
      </span>
    </button>
  );
};

export default BrandArt;
