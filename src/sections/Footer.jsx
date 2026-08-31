import { useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { resolveSocialIcon, socialHref } from "../constants/socialIcons";
import { useSocialMedia } from "../hooks/useSocialMedia.js";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const socials = useSocialMedia();

  const socialImgs = useMemo(
    () =>
      socials.map((s) => ({
        name: s.name,
        link: socialHref(s.url, `${s.name} ${s.icon}`),
        icon: resolveSocialIcon(s.icon),
      })),
    [socials]
  );

  useGSAP(() => {
    gsap.fromTo(
      footerRef.current,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 92%",
          once: true,
          invalidateOnRefresh: true,
        },
      }
    );
    // The footer is the last element and sits below async sections (blogs,
    // experience, certs…) that grow the page after ScrollTrigger caches
    // positions. Without a refresh the start point goes stale and the reveal
    // never fires — leaving the footer stuck at opacity 0. Refresh once the
    // window has loaded so positions are correct.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, { scope: footerRef });

  // Socials load async and change the footer's height; recompute trigger
  // positions once they render so the reveal fires reliably.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [socialImgs]);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-container">
        <div className="flex flex-col justify-center">
          <p>📍 Currently in India</p>
        </div>
        <div className="socials">
          {socialImgs.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="btn btn-icon"
            >
              <FontAwesomeIcon icon={s.icon} size="1x" />
            </a>
          ))}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Deepak Singh Rajput
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
