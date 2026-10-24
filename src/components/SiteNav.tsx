import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useThemeStore } from "../stores/useThemeStore";
import { useAssistantStore } from "../stores/useAssistantStore";
import { Close, Menu, Moon, Search, Sun } from "./Icons";
import GhostMark from "./GhostMark";

const NAV = [
  { hash: "work", label: "Work" },
  { hash: "experience", label: "Experience" },
  { hash: "writing", label: "Writing" },
  { hash: "contact", label: "Contact" },
];

/** Tracks which home section is under the nav, for the active link state. */
const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const ids = ["work", "about", "experience", "toolbox", "credentials", "writing", "contact"];
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const current = ids.find((id) => seen.get(id));
        setActive(current ?? "");
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    const observeAll = () => ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    observeAll();
    // Sections that render after data arrives (e.g. projects) join late.
    const t = setTimeout(observeAll, 1500);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [enabled]);
  return active;
};

const SiteNav = () => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const openMenu = useAssistantStore((s) => s.openMenu);
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const active = useActiveSection(onHome);
  const [scrolled, setScrolled] = useState(false);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  // On the home page a plain anchor scrolls; elsewhere a router link returns
  // home without a reload, and Home scrolls to the hash once it renders.
  const sectionLink = (hash: string, label: string, props: { className?: string | undefined; onClick?: () => void }) =>
    onHome ? (
      <a key={hash} href={`#${hash}`} {...props}>
        {label}
      </a>
    ) : (
      <Link key={hash} to={`/#${hash}`} {...props}>
        {label}
      </Link>
    );
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    // `on-hero` lets the nav take the hero's dark tones while it floats over it.
    <header className={`nav${onHome ? " on-hero" : ""}${scrolled ? " is-scrolled" : ""}${sheet ? " is-sheet" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" onClick={() => setSheet(false)} aria-label="Deepak Singh Rajput — home">
          <GhostMark className="nav-ghost" />
          <span className="nav-name">
            Deepak Singh Rajput
            <span className="nav-role mono">GenAI engineer</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => sectionLink(n.hash, n.label, { className: active === n.hash ? "is-active" : undefined }))}
          <Link to="/resume" className={pathname === "/resume" ? "is-active" : undefined}>
            Resume
          </Link>
        </nav>

        <div className="nav-tools">
          <button type="button" className="nav-search" onClick={() => openMenu()} aria-label="Ask or search (⌘K)">
            <Search />
            <span>Ask the ghost</span>
            <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
            <kbd>K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn nav-icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button
            type="button"
            className="icon-btn nav-icon nav-menu"
            onClick={() => setSheet((s) => !s)}
            aria-label={sheet ? "Close menu" : "Open menu"}
            aria-expanded={sheet}
            aria-controls="nav-sheet"
          >
            {sheet ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      <div id="nav-sheet" className="nav-sheet" hidden={!sheet}>
        <div className="container">
          {NAV.map((n) => sectionLink(n.hash, n.label, { onClick: () => setSheet(false) }))}
          <Link to="/resume" onClick={() => setSheet(false)}>
            Resume
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSheet(false);
              openMenu();
            }}
          >
            <Search /> Ask the ghost
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteNav;
