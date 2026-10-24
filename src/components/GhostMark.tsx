// The ghost's silhouette: a dome, straight sides and three rounded legs. Shared
// by the floating assistant and the small marks next to "ask.alkairis".
export const GHOST_BODY =
  "M8 30A24 24 0 0 1 56 30V62A5 5 0 0 1 46 62V60A4.5 4.5 0 0 0 37 60V62A5 5 0 0 1 27 62V60A4.5 4.5 0 0 0 18 60V62A5 5 0 0 1 8 62Z";

const GhostMark = ({ className = "" }: { className?: string }) => (
  <svg className={`ghost-mark ${className}`} viewBox="0 0 64 72" aria-hidden="true" focusable="false">
    <path d={GHOST_BODY} className="ghost-mark-body" />
    <ellipse cx="24" cy="33" rx="3.4" ry="4.2" className="ghost-mark-eye" />
    <ellipse cx="40" cy="33" rx="3.4" ry="4.2" className="ghost-mark-eye" />
  </svg>
);

export default GhostMark;
