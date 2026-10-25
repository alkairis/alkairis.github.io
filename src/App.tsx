import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SiteNav from "./components/SiteNav";
import Ghost from "./components/Ghost";
import AiMenu from "./components/AiMenu";
import Preloader from "./components/Preloader";
import Hero from "./sections/Hero";
import Work from "./sections/Work";
import Projects from "./sections/Projects";
import About from "./sections/About";
import Journey from "./sections/Journey";
import Toolbox from "./sections/Toolbox";
import Credentials from "./sections/Credentials";
import Writing from "./sections/Writing";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import { useReveal } from "./hooks/useReveal";
import { useScrollFx } from "./hooks/useScrollFx";
import "./components/assistant.css";
import "./styles/site.css";
import "./styles/scroll-fx.css";

/** Chrome shared by every public page: nav, the ghost and its AI menu. */
export const SiteShell = () => {
  useReveal();
  useScrollFx();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        {/* Local boundary so a lazy page swaps in under the nav, not over it. */}
        <Suspense fallback={<div className="page-wait" />}>
          <Outlet />
        </Suspense>
      </main>
      <div className="scroll-rail" data-fx-rail aria-hidden="true">
        <i />
      </div>
      <Ghost />
      <AiMenu />
      <Preloader />
    </>
  );
};

const Home = () => {
  const { hash } = useLocation();

  // Arriving from another route with a hash (/#work) — React Router doesn't
  // scroll to anchors, so do it once the sections have rendered.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Hero />
      <Work />
      <Projects />
      <About />
      <Journey />
      <Toolbox />
      <Credentials />
      <Writing />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
