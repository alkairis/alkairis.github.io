import { useEffect, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";

import TitleHeader from "../components/TitleHeader";
import ProjectModal from "../components/ProjectModal";
import { useRecognitionStore } from "../stores/useRecognitionStore";
import type { Recognition } from "../api/api";
import type { ModalProject } from "../types/ui";
import {
  fallbackRecognitionStats,
  fallbackRecognitions,
} from "../constants/fallbacks";

// Map a recognition entry onto the shape ProjectModal expects so it reuses the
// exact same morphing modal as the Projects section.
const toModalProject = (card: Recognition): ModalProject => ({
  id: card.id,
  name: card.title,
  description: card.description,
  image_url: card.image,
  technologies: [card.year, card.category, ...(card.tags ?? [])].filter(Boolean),
  demo_url: card.link || undefined,
});

const Achievements = () => {
  const [activeCard, setActiveCard] = useState<ModalProject | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

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

  const openCard = (
    card: Recognition,
    e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setActiveCard(toModalProject(card));
  };

  // Click + keyboard accessibility, mirroring the Projects showcase cards.
  const blockProps = (card: Recognition) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-haspopup": "dialog" as const,
    "aria-label": `View details for ${card.title}`,
    onClick: (e: MouseEvent<HTMLElement>) => openCard(card, e),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCard(card, e);
      }
    },
  });

  return (
    <section id="recognitions" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Awards & Recognition"
          sub="🎖️👏 Recognition"
          subtitle="A collection of my professional journey and the recognition I've received for my contributions in Generative AI, Data Engineering, and technical excellence."
        />

        <div className="max-w-[960px] mx-auto">
          {/* ── Headline stats ─────────────────────────────────────── */}
          <div className="grid-3-cols mt-16 reveal-stagger reveal-stagger-pop">
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
          <div className="mt-8 flex flex-col gap-6 reveal-stagger reveal-stagger-left">
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
