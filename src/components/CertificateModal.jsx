import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { faArrowUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./certificateModal.css";

/**
 * CertificateModal — a morphing modal for a professional certification,
 * styled after a credential card (logo, name, issuing org, dates,
 * credential ID and a "Show credential" link).
 *
 * `certificate` shape:
 *   { id, name, organization, image, issueDate, expiryDate?,
 *     credentialId?, credentialUrl? }
 *
 * Props mirror ProjectModal so the two behave identically:
 *  - certificate:  certification to display, or null when closed
 *  - originRect:   DOMRect of the clicked card (origin of the morph)
 *  - onClose:      called after the exit animation completes
 */
const DURATION = 0.46;

const CertificateModal = ({
  certificate,
  originRect,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
}) => {
  const [render, setRender] = useState(certificate);

  const originRef = useRef(null);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const tweenRef = useRef(null);

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) {
      setRender(null);
      onClose?.();
      return;
    }

    tweenRef.current?.kill();
    gsap.to(backdropRef.current, { opacity: 0, duration: DURATION * 0.8, ease: "power2.in" });

    const finish = () => {
      setRender(null);
      lastFocusedRef.current?.focus?.();
      onClose?.();
    };

    const origin = originRef.current;
    if (origin) {
      const last = panel.getBoundingClientRect();
      const dx = origin.left - last.left;
      const dy = origin.top - last.top;
      const sx = origin.width / last.width;
      const sy = origin.height / last.height;

      gsap.to(contentRef.current, { opacity: 0, duration: DURATION * 0.45, ease: "power2.in" });
      tweenRef.current = gsap.to(panel, {
        x: dx,
        y: dy,
        scaleX: sx,
        scaleY: sy,
        opacity: 0,
        duration: DURATION,
        ease: "power3.inOut",
        onComplete: finish,
      });
    } else {
      tweenRef.current = gsap.to(panel, {
        scale: 0.92,
        opacity: 0,
        duration: DURATION * 0.8,
        ease: "power2.in",
        onComplete: finish,
      });
    }
  }, [onClose]);

  // Capture origin + focus when a new certificate arrives.
  useEffect(() => {
    if (certificate) {
      originRef.current = originRect ?? null;
      lastFocusedRef.current = document.activeElement;
      setRender(certificate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate]);

  // Entry animation.
  useEffect(() => {
    if (!render) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    tweenRef.current?.kill();
    gsap.set(backdrop, { opacity: 0 });
    gsap.to(backdrop, { opacity: 1, duration: DURATION * 0.9, ease: "power2.out" });

    const origin = originRef.current;
    if (origin) {
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
        duration: DURATION,
        ease: "power3.inOut",
      });
      gsap.to(contentRef.current, {
        opacity: 1,
        duration: DURATION * 0.7,
        delay: DURATION * 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.set(panel, { scale: 0.92, opacity: 0, transformOrigin: "center center" });
      gsap.set(contentRef.current, { opacity: 1 });
      tweenRef.current = gsap.to(panel, { scale: 1, opacity: 1, duration: DURATION, ease: "power3.out" });
    }

    closeBtnRef.current?.focus?.();
  }, [render]);

  // Lock body scroll + Escape / focus trap while open.
  useEffect(() => {
    if (!render) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        handleClose();
        return;
      }

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

  const dateLine = [
    render.issueDate && `Issued ${render.issueDate}`,
    render.expiryDate && `Expires ${render.expiryDate}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return createPortal(
    <div
      className="cmodal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && !panelRef.current?.contains(e.target)) handleClose();
      }}
    >
      <div ref={backdropRef} className="cmodal-backdrop" aria-hidden="true" />

      <div
        ref={panelRef}
        className="cmodal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmodal-title"
      >
        <div ref={contentRef} className="cmodal-content">
          <div className="cmodal-hero">
            {(render.certificateImage || render.image) && (
              <img
                src={render.certificateImage || render.image}
                alt={render.name}
              />
            )}
            <button
              ref={closeBtnRef}
              type="button"
              className="cmodal-close"
              onClick={handleClose}
              aria-label="Close certificate details"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="cmodal-detail">
            <div className="cmodal-heading">
              <h2 id="cmodal-title" className="cmodal-name">
                {render.name}
              </h2>
              <p className="cmodal-org">{render.organization}</p>
            </div>

            <div className="cmodal-meta">
              {dateLine && <p className="cmodal-dates">{dateLine}</p>}
              {render.credentialId && (
                <p className="cmodal-credid">Credential ID {render.credentialId}</p>
              )}
            </div>

            {render.credentialUrl && (
              <a
                className="cmodal-btn"
                href={render.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Show credential
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CertificateModal;
