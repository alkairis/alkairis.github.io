import { useEffect, useRef } from "react";
import Footer from "./sections/Footer.jsx";
import Contact from "./sections/Contact.jsx";
import Experience from "./sections/Experience.jsx";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import ShowcaseSection from "./sections/ShowcaseSection.jsx";
import Navbar from "./components/NavBar.jsx";
import Tech from "./sections/Tech.jsx";
import Blog from "./sections/Blog.jsx";
import ChatBot from "./components/ChatBot.jsx";
import CornerPreloader from "./components/CornerPreloader.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import { LoadingProvider, useAppLoading } from "./context/LoadingContext.jsx";
import Certificates from "./sections/Certificates.jsx";
import Achievements from "./sections/Achievements.jsx";

const AppContent = () => {
  const { isLoading } = useAppLoading();
  const orbRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const posRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };

    const tick = () => {
      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.05;
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.05;

      if (orbRef.current) {
        const x = posRef.current.x * 100;
        const y = posRef.current.y * 100;
        orbRef.current.style.background =
          `radial-gradient(680px circle at ${x}% ${y}%, rgba(14, 165, 233, 0.18) 0%, rgba(99, 102, 241, 0.11) 42%, transparent 72%)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="app-shell">
      <CornerPreloader isLoading={isLoading} />
      <CustomCursor />

      <div className="app-bg" aria-hidden="true">
        <div className="app-blob app-blob-purple" />
        <div className="app-blob app-blob-cyan" />
        <div ref={orbRef} className="app-orb" />
        <div className="app-grid" />
      </div>

      <div className="app-content">
        <Navbar />
        <Hero />
        <About />
        <ShowcaseSection />
        <Experience />
        <Tech />
        <Certificates />
        <Achievements />
        <Blog />
        <Contact />
        <Footer />
      </div>

      {/* <ChatBot /> */}
    </div>
  );
};

const App = () => (
  <LoadingProvider>
    <AppContent />
  </LoadingProvider>
);

export default App;
