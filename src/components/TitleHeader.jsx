import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const TitleHeader = ({ title, sub, subtitle }) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll(".th-anim");
    if (!els?.length) return;

    gsap.fromTo(
      els,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
        },
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="th-anim hero-badge">
        <p>{sub}</p>
      </div>
      <div className="th-anim">
        {/* h2, not h1: the hero owns the page's single h1, and every section
            heading sits below it. Guarded so a caller that passes no title
            doesn't emit an empty heading. */}
        {title && (
          <h2 className="font-semibold md:text-4xl text-2xl text-center">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-sm text-center text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      <div className="th-anim th-line" aria-hidden="true" />
    </div>
  );
};

export default TitleHeader;
