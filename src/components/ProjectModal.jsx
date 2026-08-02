import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./projectModal.css";

/**
 * ProjectModal — a full-screen modal that morphs open from the card that was
 * clicked, showing a project's full details. Controlled via the `project` and
 * `originRect` props; calls `onClose` once it has finished animating out.
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

const SPEED_MS = { slow: 700, normal: 460, fast: 280 };

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
  // The project currently rendered — kept during the exit animation so the
  // content stays on screen until the morph-out finishes.
  const [render, setRender] = useState(project);

  const originRef = useRef(null);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const tweenRef = useRef(null);

  const duration = (SPEED_MS[animationSpeed] ?? SPEED_MS.normal) / 1000;

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      setRender(null);
      onClose?.();
      return;
    }

    tweenRef.current?.kill();
    gsap.to(backdropRef.current, { opacity: 0, duration: duration * 0.8, ease: "power2.in" });

    const finish = () => {
      setRender(null);
      lastFocusedRef.current?.focus?.();
      onClose?.();
    };

    const origin = originRef.current;
    if (animationVariant === "scale-morph" && origin) {
      const last = panel.getBoundingClientRect();
      const dx = origin.left - last.left;
      const dy = origin.top - last.top;
      const sx = origin.width / last.width;
      const sy = origin.height / last.height;

      gsap.to(contentRef.current, { opacity: 0, duration: duration * 0.45, ease: "power2.in" });
      tweenRef.current = gsap.to(panel, {
        x: dx,
        y: dy,
        scaleX: sx,
        scaleY: sy,
        opacity: 0,
        duration,
        ease: "power3.inOut",
        onComplete: finish,
      });
    } else {
      tweenRef.current = gsap.to(panel, {
        scale: animationVariant === "fade" ? 1 : 0.92,
        opacity: 0,
        duration: duration * 0.8,
        ease: "power2.in",
        onComplete: finish,
      });
    }
  }, [animationVariant, duration, onClose]);

  // Open: when a new project arrives, capture origin + focus and render it.
  useEffect(() => {
    if (project) {
      originRef.current = originRect ?? null;
      lastFocusedRef.current = document.activeElement;
      setRender(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  // Entry animation — runs once the modal is in the DOM.
  useEffect(() => {
    if (!render) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    tweenRef.current?.kill();
    gsap.set(backdrop, { opacity: 0 });
    gsap.to(backdrop, { opacity: 1, duration: duration * 0.9, ease: "power2.out" });

    const origin = originRef.current;
    if (animationVariant === "scale-morph" && origin) {
      const last = panel.getBoundingClientRect();
      const dx = origin.left - last.left;
      const dy = origin.top - last.top;
      const sx = origin.width / last.width;
      const sy = origin.height / last.height;

      gsap.set(panel, { x: dx, y: dy, scaleX: sx, scaleY: sy, opacity: 1, transformOrigin: "top left" });
      gsap.set(contentRef.current, { opacity: 0 });

      tweenRef.current = gsap.to(panel, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration,
        ease: "power3.inOut",
      });
      gsap.to(contentRef.current, {
        opacity: 1,
        duration: duration * 0.7,
        delay: duration * 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.set(panel, {
        scale: animationVariant === "fade" ? 1 : 0.92,
        opacity: 0,
        transformOrigin: "center center",
      });
      gsap.set(contentRef.current, { opacity: 1 });
      tweenRef.current = gsap.to(panel, { scale: 1, opacity: 1, duration, ease: "power3.out" });
    }

    closeBtnRef.current?.focus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  // Lock body scroll + Escape handling while the modal is open.
  useEffect(() => {
    if (!render) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        handleClose();
        return;
      }

      // Trap focus inside the dialog so Tab/Shift+Tab can't reach the page
      // behind the still-visible modal.
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeEl = document.activeElement;

        if (e.shiftKey) {
          if (activeEl === first || !panel.contains(activeEl)) {
            e.preventDefault();
            last.focus();
          }
        } else if (activeEl === last || !panel.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [render, closeOnEscape, handleClose]);

  if (!render) return null;

  // Portal to <body> so the modal escapes any section's stacking context
  // (e.g. the GSAP transform left on the showcase section) and reliably
  // covers the whole screen, including the fixed navbar.
  return createPortal(
    <div
      className="pmodal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && !panelRef.current?.contains(e.target)) handleClose();
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
                onClick={handleClose}
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
