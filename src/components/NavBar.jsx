import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { navLinks } from "../constants/";
import { useResumeUrl } from "../hooks/useResumeUrl.js";

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
        <div className="inner">
          <a href="#hero" className="logo font-brand" onClick={closeMenu}>
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
                className="contact-btn group hidden sm:flex"
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

            <a href="#contact" className="contact-btn group">
              <div className="inner">
                <span>Contact me</span>
              </div>
            </a>

            {/* Hamburger — mobile only */}
            <button
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
      <nav
        className={`fixed top-0 right-0 h-full w-72 z-[100] border-l
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
