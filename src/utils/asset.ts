// Resolve a path to a file in /public against Vite's configured base URL.
//
// import.meta.env.BASE_URL is injected at build time from vite's `base` option
// and always ends with a trailing slash ("/" for a root/custom-domain deploy,
// "/alkairis.dev/" for a project-page deploy at user.github.io/alkairis.dev/).
// Prefixing public asset paths with it lets the same build work at either URL
// instead of hardcoding "/…" which only resolves at the domain root.
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
