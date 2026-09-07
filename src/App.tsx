import { useEffect, useRef } from "react";
import Footer from "./sections/Footer";
import Contact from "./sections/Contact";
import Experience from "./sections/Experience";
import Hero from "./sections/Hero";
import About from "./sections/About";
import ShowcaseSection from "./sections/ShowcaseSection";
import Navbar from "./components/NavBar";
import Tech from "./sections/Tech";
import Blog from "./sections/Blog";
import CornerPreloader from "./components/CornerPreloader";
import CustomCursor from "./components/CustomCursor";
import { LoadingProvider } from "./context/LoadingProvider";
import { useAppLoading } from "./context/loadingContext";
import Certificates from "./sections/Certificates";
import Achievements from "./sections/Achievements";

const AppContent = () => {
  const { isLoading } = useAppLoading();
  const orbRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const posRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
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
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
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

      {/* ChatBot is built but not shipped: it needs VITE_CHATBOT_API_URL and a
          backend to answer. Re-enable by importing ./components/ChatBot and
          rendering it here. */}
    </div>
  );
};

const App = () => (
  <LoadingProvider>
    <AppContent />
  </LoadingProvider>
);

export default App;
