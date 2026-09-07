import { createPortal } from "react-dom";
import { faArrowUpRightFromSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMorphModal } from "../hooks/useMorphModal.js";
import "./certificateModal.css";

/**
 * CertificateModal — a morphing modal for a professional certification,
 * styled after a credential card (logo, name, issuing org, dates,
 * credential ID and a "Show credential" link).
 *
 * Behaviour comes from useMorphModal, shared with ProjectModal, so the two
 * animate and trap focus identically.
 *
 * `certificate` shape:
 *   { id, name, organization, image, issueDate, expiryDate?,
 *     credentialId?, credentialUrl? }
 *
 * Props:
 *  - certificate:  certification to display, or null when closed
 *  - originRect:   DOMRect of the clicked card (origin of the morph)
 *  - onClose:      called after the exit animation completes
 */
const CertificateModal = ({
  certificate,
  originRect,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
}) => {
  const { render, panelRef, backdropRef, contentRef, closeBtnRef, close } =
    useMorphModal({ item: certificate, originRect, onClose, closeOnEscape });

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
        if (closeOnBackdrop && !panelRef.current?.contains(e.target)) close();
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
              onClick={close}
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
