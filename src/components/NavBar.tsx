import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { navLinks } from "../constants/";
import { useResumeUrl } from "../hooks/useResumeUrl";
import { useScrollLock } from "../hooks/useScrollLock";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const resumeUrl = useResumeUrl();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when the mobile menu is open. Shared, reference-counted
  // lock — a modal opened on top of the drawer must not clear it on close.
  useScrollLock(menuOpen);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
        <div className="inner">
          <a href="#hero" className="logo font-audiowide" onClick={closeMenu}>
            Alkairis
          </a>

          {/* Desktop nav */}
          <nav className="desktop">
            <ul>
              {navLinks.map(({ link, name }) => (
                <li key={name} className="group">
                  <a href={link}>
                    <span className="label">{name}</span>
                    <span className="underline" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {resumeUrl && (
              <a
                href={resumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={`contact-btn group hidden sm:flex ${
                  menuOpen ? "max-lg:!hidden" : ""
                }`}
                aria-label="Download CV"
              >
                <div className="inner flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faDownload}
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                  <span>CV</span>
                </div>
              </a>
            )}

            {/* Hidden while the drawer is open: the header now sits above the
                drawer (so its close button stays tappable), which would
                otherwise leave two "Contact me" CTAs on screen at once. */}
            <a
              href="#contact"
              className={`contact-btn group ${menuOpen ? "max-lg:!hidden" : ""}`}
            >
              <div className="inner">
                <span>Contact me</span>
              </div>
            </a>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 z-[110] relative"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-[#0f172a] transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile drawer panel */}
      {/* z-[95], below the header's z-[100]. The header creates its own stacking
          context, so the hamburger's z-[110] is scoped inside it and cannot rise
          above this drawer — at z-[100] the drawer painted over the very button
          that closes it, leaving the backdrop as the only way out on mobile.
          The drawer's pt-24 already clears the header, so ordering it underneath
          is what the layout expects. */}
      <nav
        className={`fixed top-0 right-0 h-full w-72 z-[95] border-l
          flex flex-col pt-24 pb-10 px-8 gap-8 transition-transform duration-300 ease-in-out lg:hidden
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background: "rgba(240, 246, 255, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(14, 165, 233, 0.18)",
        }}
        aria-label="Mobile navigation"
      >
        <ul className="flex flex-col gap-6">
          {navLinks.map(({ link, name }) => (
            <li key={name}>
              <a
                href={link}
                onClick={closeMenu}
                className="text-[#0f172a] text-xl font-semibold hover:text-[#0ea5e9] transition-colors duration-200 block"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3">
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#0f172a",
                color: "#ffffff",
                border: "1.5px solid #0f172a",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0f172a"; }}
            >
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </a>
          )}

          <a
            href="#contact"
            onClick={closeMenu}
            className="px-5 py-3 rounded-lg font-semibold text-center transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "#0f172a",
              color: "#ffffff",
              border: "1.5px solid #0f172a",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#0f172a"; }}
          >
            Contact me
          </a>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
