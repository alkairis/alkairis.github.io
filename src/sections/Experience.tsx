import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useExperience } from "../hooks/resources";
import { fallbackExperiences } from "../constants/fallbacks";
import TitleHeader from "../components/TitleHeader";
import type { Experience as ExperienceEntry } from "../api/api";
import "./experience.css";

// The API has no "kind" field, so education entries are recognised by their
// title or institution. Only used for the small Experience/Education tag.
const EDUCATION_PATTERN =
  /\b(b\.?\s?tech|m\.?\s?tech|bachelor|master|degree|diploma|ph\.?d|university|vishwavidyalaya|college|institute|school)\b/i;

const isEducation = (entry: ExperienceEntry) =>
  EDUCATION_PATTERN.test(`${entry.title} ${entry.company}`);

const isCurrent = (entry: ExperienceEntry) => /present/i.test(entry.date);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
  </svg>
);

const Logo = ({ entry, className }: { entry: ExperienceEntry; className: string }) => (
  <div className={`exp-logo ${className}`}>
    {entry.logo ? (
      <img src={entry.logo} alt={`${entry.company} logo`} loading="lazy" />
    ) : (
      <span aria-hidden="true">{initials(entry.company)}</span>
    )}
  </div>
);

/**
 * Professional Journey as a master–detail view: a vertical list of roles on
 * the left (a WAI-ARIA tablist, so arrow keys / Home / End move between
 * roles) and the selected role's full details in a single card on the right.
 * Below `lg` the list stacks above the card.
 */
const Experience = () => {
  const { data: experiences, loading } = useExperience();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Never leave the section empty: while the (possibly cold) backend responds
  // show skeletons, and if it returns nothing fall back to static content.
  const visibleExperiences = experiences.length
    ? experiences
    : fallbackExperiences;

  // Clamp in case the list shrinks (fallback → API data) after a selection.
  const selectedIndex = Math.min(active, visibleExperiences.length - 1);
  const selected = visibleExperiences[selectedIndex];

  const focusTab = (index: number) => {
    const count = visibleExperiences.length;
    const next = (index + count) % count;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keyMap: Record<string, number> = {
      ArrowDown: selectedIndex + 1,
      ArrowRight: selectedIndex + 1,
      ArrowUp: selectedIndex - 1,
      ArrowLeft: selectedIndex - 1,
      Home: 0,
      End: visibleExperiences.length - 1,
    };
    const target = keyMap[e.key];
    if (target === undefined) return;
    e.preventDefault();
    focusTab(target);
  };

  return (
    <section
      id="experience"
      className="flex-center md:mt-40 mt-20 section-padding xl:px-0"
    >
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="Professional Journey"
          sub="💼 Building impactful solutions, one role at a time."
        />

        {/* `!selected` only narrows the type: the fallback list is never empty. */}
        {loading || !selected ? (
          <div className="exp-layout">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card w-full h-24" />
              ))}
            </div>
            <div className="exp-detail flex flex-col gap-4">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-4 w-full mt-4" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-4/6" />
            </div>
          </div>
        ) : (
          <div className="exp-layout">
            <div className="reveal-left">
              <div
                role="tablist"
                aria-label="Roles"
                aria-orientation="vertical"
                className="exp-list"
              >
                {visibleExperiences.map((entry, i) => {
                  const isActive = i === selectedIndex;
                  return (
                    <button
                      key={entry.id}
                      ref={(node) => {
                        tabRefs.current[i] = node;
                      }}
                      type="button"
                      role="tab"
                      id={`exp-tab-${entry.id}`}
                      aria-selected={isActive}
                      aria-controls="exp-panel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActive(i)}
                      onKeyDown={handleKeyDown}
                      className={`exp-item${isActive ? " is-active" : ""}`}
                    >
                      <Logo entry={entry} className="exp-logo--sm" />
                      <span className="exp-item-text">
                        <span className="exp-item-title">{entry.title}</span>
                        <span className="exp-item-company">{entry.company}</span>
                        <span className="exp-item-date">{entry.date}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {visibleExperiences.length > 1 && (
                <p className="exp-hint">
                  ↑ ↓ Use arrow keys or click to switch
                </p>
              )}
            </div>

            <div className="reveal-right min-w-0">
              <article
                key={selected.id}
                id="exp-panel"
                role="tabpanel"
                aria-labelledby={`exp-tab-${selected.id}`}
                className="exp-detail exp-detail--enter"
              >
                {selected.bannerImage && (
                  <img
                    src={selected.bannerImage}
                    alt={`${selected.company} banner`}
                    className="exp-banner"
                  />
                )}

                <header className="exp-detail-head">
                  <Logo entry={selected} className="exp-logo--lg" />
                  <div>
                    <span
                      className={`exp-tag ${isEducation(selected) ? "exp-tag--edu" : "exp-tag--work"}`}
                    >
                      {isEducation(selected) ? "Education" : "Experience"}
                    </span>
                    <h3 className="exp-detail-title">{selected.title}</h3>
                    {selected.company && (
                      <p className="exp-detail-company">{selected.company}</p>
                    )}
                  </div>
                </header>

                <div className="exp-meta">
                  {selected.date && (
                    <span className="exp-date">
                      <CalendarIcon />
                      {selected.date}
                    </span>
                  )}
                  {isCurrent(selected) && (
                    <span className="exp-now">Current role</span>
                  )}
                </div>

                <hr className="exp-divider" />

                {selected.responsibilities.length > 0 && (
                  <>
                    <p className="exp-label">Key contributions</p>
                    <ul className="exp-points">
                      {selected.responsibilities.map((responsibility, i) => (
                        <li key={i}>{responsibility}</li>
                      ))}
                    </ul>
                  </>
                )}

                {selected.recognition.length > 0 && (
                  <>
                    <p className="exp-label">Recognition</p>
                    <ul className="exp-awards">
                      {selected.recognition.map((item, i) => (
                        <li key={i} className="exp-award">
                          <TrophyIcon />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
