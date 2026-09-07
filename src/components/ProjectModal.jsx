import { createPortal } from "react-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMorphModal } from "../hooks/useMorphModal.js";
import "./projectModal.css";

/**
 * ProjectModal — a full-screen modal that morphs open from the card that was
 * clicked, showing a project's full details. Controlled via the `project` and
 * `originRect` props; calls `onClose` once it has finished animating out.
 *
 * The open/close animation, focus trap, Escape handling and scroll lock all
 * live in useMorphModal, which CertificateModal shares.
 *
 * `project` matches the backend `GetProjects` schema:
 *   { id, name, description, github_url, demo_url, technologies[], image_url }
 *
 * Props:
 *  - project:          project to display, or null when closed
 *  - originRect:       DOMRect of the clicked card (origin of the morph)
 *  - onClose:          called after the exit animation completes
 *  - animationVariant: "scale-morph" (default) | "scale" | "fade"
 *  - animationSpeed:   "slow" | "normal" (default) | "fast"
 *  - closeOnEscape:    close when Escape is pressed (default true)
 *  - closeOnBackdrop:  close when the backdrop is clicked (default true)
 *  - showCloseButton:  render the rotating close button (default true)
 */
const ProjectModal = ({
  project,
  originRect,
  onClose,
  animationVariant = "scale-morph",
  animationSpeed = "normal",
  closeOnEscape = true,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const { render, panelRef, backdropRef, contentRef, closeBtnRef, close } =
    useMorphModal({
      item: project,
      originRect,
      onClose,
      variant: animationVariant,
      speed: animationSpeed,
      closeOnEscape,
    });

  if (!render) return null;

  // Portal to <body> so the modal escapes any section's stacking context
  // (e.g. the GSAP transform left on the showcase section) and reliably
  // covers the whole screen, including the fixed navbar.
  return createPortal(
    <div
      className="pmodal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && !panelRef.current?.contains(e.target)) close();
      }}
    >
      <div ref={backdropRef} className="pmodal-backdrop" aria-hidden="true" />

      <div
        ref={panelRef}
        className="pmodal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pmodal-title"
      >
        <div ref={contentRef} className="pmodal-content">
          <div className="pmodal-hero">
            {render.image_url && <img src={render.image_url} alt={render.name} />}
            <div className="pmodal-hero-scrim" aria-hidden="true" />
            <h2 id="pmodal-title" className="pmodal-name">
              {render.name}
            </h2>
            {showCloseButton && (
              <button
                ref={closeBtnRef}
                type="button"
                className="pmodal-close"
                onClick={close}
                aria-label="Close project details"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          <div className="pmodal-detail">
            <p className="pmodal-description">{render.description}</p>

            {render.technologies?.length > 0 && (
              <div className="pmodal-tech">
                {render.technologies.map((tech) => (
                  <span key={tech} className="pmodal-tech-chip">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="pmodal-actions">
              {render.github_url && (
                <a
                  className="pmodal-btn pmodal-btn-ghost"
                  href={render.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGithub} />
                  Source code
                </a>
              )}
              {render.demo_url && (
                <a
                  className="pmodal-btn pmodal-btn-primary"
                  href={render.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  Live demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModal;
