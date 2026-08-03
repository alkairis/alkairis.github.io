import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import TitleHeader from "../components/TitleHeader";
import ProjectModal from "../components/ProjectModal";
import { useRecognitionStore } from "../stores/useRecognitionStore";
import {
  fallbackRecognitionStats,
  fallbackRecognitions,
} from "../constants/fallbacks";

gsap.registerPlugin(ScrollTrigger);

// Map a recognition entry onto the shape ProjectModal expects so it reuses the
// exact same morphing modal as the Projects section.
const toModalProject = (card) => ({
  id: card.id,
  name: card.title,
  description: card.description,
  image_url: card.image,
  technologies: [card.year, card.category, ...(card.tags ?? [])].filter(Boolean),
  demo_url: card.link || undefined,
});

const Achievements = () => {
  const sectionRef = useRef(null);
  const [activeCard, setActiveCard] = useState(null);
  const [originRect, setOriginRect] = useState(null);

  const stats = useRecognitionStore((state) => state.stats);
  const cards = useRecognitionStore((state) => state.cards);
  const status = useRecognitionStore((state) => state.status);
  const fetchRecognition = useRecognitionStore((state) => state.fetchRecognition);

  useEffect(() => {
    // Errors are surfaced through the store's status; swallow the rejection so
    // it doesn't bubble as an unhandled promise.
    fetchRecognition().catch(() => {});
  }, [fetchRecognition]);

  // Skeletons while the (possibly cold) backend responds; static fallbacks if
  // it returns nothing, so the section is never empty.
  const loading = status === "idle" || status === "loading";
  const visibleStats = stats.length ? stats : fallbackRecognitionStats;
  const visibleCards = cards.length ? cards : fallbackRecognitions;

  const openCard = (card, e) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setActiveCard(toModalProject(card));
  };

  // Click + keyboard accessibility, mirroring the Projects showcase cards.
  const blockProps = (card) => ({
    role: "button",
    tabIndex: 0,
    "aria-haspopup": "dialog",
    "aria-label": `View details for ${card.title}`,
    onClick: (e) => openCard(card, e),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCard(card, e);
      }
    },
  });

  useGSAP(() => {
    gsap.utils.toArray(".recog-stat").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.1 * i,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    gsap.utils.toArray(".recog-block").forEach((el) => {
      gsap.fromTo(
        el,
        { x: -45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });
  }, { scope: sectionRef, dependencies: [visibleStats, visibleCards, loading] });

  return (
    <section id="recognitions" ref={sectionRef} className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          sub="🎖️👏 Recognition"
          subtitle="A collection of my professional journey and the recognition I've received for my contributions in Generative AI, Data Engineering, and technical excellence."
        />

        <div className="max-w-[960px] mx-auto">
          {/* ── Headline stats ─────────────────────────────────────── */}
          <div className="grid-3-cols mt-16">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="recog-stat-skeleton arctic-glow-card skeleton-card"
                  >
                    <div className="skeleton h-9 w-20" />
                    <div className="skeleton h-4 w-32" />
                  </div>
                ))
              : visibleStats.map((stat) => (
                  <div key={stat.label} className="recog-stat arctic-glow-card">
                    <p className="recog-stat-value">{stat.value}</p>
                    <p className="recog-stat-label">{stat.label}</p>
                  </div>
                ))}
          </div>

          {/* ── Recognition timeline ───────────────────────────────── */}
          <div className="mt-8 flex flex-col gap-6">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="recog-block-skeleton arctic-glow-card skeleton-card"
                  >
                    <div className="skeleton recog-skeleton-thumb" />
                    <div className="recog-skeleton-body">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-5 w-2/3" />
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-4 w-5/6" />
                    </div>
                  </div>
                ))
              : visibleCards.map((card) => (
              <div
                key={card.id}
                className="recog-block arctic-glow-card"
                {...blockProps(card)}
              >
                <span className="recog-year">{card.year}</span>

                {card.image && (
                  <div className="recog-thumb">
                    <img src={card.image} alt={card.title} loading="lazy" />
                  </div>
                )}

                <div className="recog-body">
                  <span className="recog-badge">{card.category}</span>
                  <h3 className="recog-title">{card.title}</h3>
                  <p className="recog-desc">{card.description}</p>
                </div>

                <span className="recog-arrow" aria-hidden="true">
                  &#8599;
                </span>
              </div>
                ))}
          </div>
        </div>
      </div>

      <ProjectModal
        project={activeCard}
        originRect={originRect}
        onClose={() => setActiveCard(null)}
        animationVariant="scale"
        animationSpeed="normal"
        closeOnEscape
        closeOnBackdrop
        showCloseButton
      />
    </section>
  );
};

export default Achievements;
