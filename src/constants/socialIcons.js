import {
  faBehance,
  faBitbucket,
  faBluesky,
  faCodepen,
  faDev,
  faDiscord,
  faDocker,
  faDribbble,
  faFacebook,
  faFacebookF,
  faFigma,
  faGithub,
  faGithubAlt,
  faGitlab,
  faGoogle,
  faHashnode,
  faInstagram,
  faKaggle,
  faLinkedin,
  faLinkedinIn,
  faMastodon,
  faMedium,
  faMediumM,
  faNpm,
  faOrcid,
  faReddit,
  faSlack,
  faSpotify,
  faStackOverflow,
  faTelegram,
  faThreads,
  faTwitter,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faLink,
  faAt,
  faEnvelope,
  faGlobe,
  faPhone,
  faPhoneFlip,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

// The social-media API stores `icon` as a Font Awesome export name, e.g.
// "faLinkedinIn", "faMedium", "faAt".
//
// Both packs are imported icon by icon rather than as a namespace. A
// namespace import plus a computed lookup (brandIcons[name]) is unanalysable
// by the bundler, so it defeats tree-shaking and ships all 609 brand icons to
// resolve the handful actually in use. The trade-off is that a platform
// missing from these maps renders the generic link icon — add its export name
// here to give it a real one.
const BRAND_ICONS = {
  faBehance,
  faBitbucket,
  faBluesky,
  faCodepen,
  faDev,
  faDiscord,
  faDocker,
  faDribbble,
  faFacebook,
  faFacebookF,
  faFigma,
  faGithub,
  faGithubAlt,
  faGitlab,
  faGoogle,
  faHashnode,
  faInstagram,
  faKaggle,
  faLinkedin,
  faLinkedinIn,
  faMastodon,
  faMedium,
  faMediumM,
  faNpm,
  faOrcid,
  faReddit,
  faSlack,
  faSpotify,
  faStackOverflow,
  faTelegram,
  faThreads,
  faTwitter,
  faWhatsapp,
  faXTwitter,
  faYoutube,
};
const SOLID_ICONS = {
  faAt,
  faEnvelope,
  faGlobe,
  faPhone,
  faPhoneFlip,
  faLocationDot,
  faLink,
};

/**
 * Convert an icon token to its Font Awesome export name. Accepts an export
 * name as-is ("faLinkedinIn") or a kebab/class token ("fa-linkedin-in",
 * "linkedin-in") which it converts to the "fa" + PascalCase export form.
 */
const toExportName = (token) => {
  if (/^fa[A-Z]/.test(token)) return token;
  const parts = token.replace(/^fa-/, "").split("-").filter(Boolean);
  if (!parts.length) return "";
  return "fa" + parts.map((p) => p[0].toUpperCase() + p.slice(1)).join("");
};

/**
 * Resolve a FontAwesome icon definition from the API's `icon` string. Handles
 * both the stored export-name format ("faLinkedinIn") and Font Awesome class
 * strings ("fa-brands fa-linkedin-in"). Falls back to a generic link icon when
 * the value is empty or references an icon that isn't bundled.
 */
export const resolveSocialIcon = (icon) => {
  const tokens = String(icon ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Ignore style-prefix tokens (fa-brands / fa-solid / ...); the icon name is
  // the remaining meaningful token.
  const nameToken = tokens.find(
    (t) => !/^(fa-(brands|solid|regular)|fab|fas|far)$/.test(t)
  );
  if (!nameToken) return faLink;

  const exportName = toExportName(nameToken);
  if (!exportName) return faLink;

  if (BRAND_ICONS[exportName]) return BRAND_ICONS[exportName];
  if (SOLID_ICONS[exportName]) return SOLID_ICONS[exportName];

  return faLink;
};

/**
 * Build an anchor href from a social link. Mail entries get a `mailto:` prefix
 * when the URL is a bare address; everything else is used as-is.
 */
export const socialHref = (url, hints = "") => {
  if (!url) return "#";
  const isMail = /mail|email|@/.test(`${url} ${hints}`.toLowerCase());
  if (isMail && !url.startsWith("mailto:") && !url.startsWith("http")) {
    return `mailto:${url}`;
  }
  return url;
};

/** A human-friendly display value for a URL (protocol + www stripped). */
export const socialDisplayValue = (url) => {
  if (!url) return "";
  return url
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
};

/**
 * Contact-method filter for the "Get in touch" section: only email, phone /
 * contact number, and LinkedIn are shown there (the full set still renders in
 * the hero and footer). Matches on the entry name and icon.
 */
export const isContactMethod = ({ name = "", icon = "" } = {}) => {
  const haystack = `${name} ${icon}`.toLowerCase();
  return /mail|email|at\b|envelope|linkedin|phone|whatsapp|call|mobile|contact|number/.test(
    haystack
  );
};
