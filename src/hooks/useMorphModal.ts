import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import type { ModalAnimationVariant, ModalSpeed } from "../types/ui";

const SPEED_MS: Record<ModalSpeed, number> = { slow: 700, normal: 460, fast: 280 };

/** Selector for the elements the focus trap cycles between. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type UseMorphModalOptions<T> = {
  /** The record to display, or null when closed. */
  item: T | null;
  /** DOMRect of the clicked card — the origin the panel morphs out of. */
  originRect?: DOMRect | null;
  /** Called once the exit animation completes. */
  onClose?: () => void;
  variant?: ModalAnimationVariant;
  speed?: ModalSpeed;
  closeOnEscape?: boolean;
};

export type UseMorphModalResult<T> = {
  /**
   * The record to render. Held locally so content stays on screen through the
   * exit animation, and cleared only once the morph finishes.
   */
  render: T | null;
  panelRef: RefObject<HTMLDivElement | null>;
  backdropRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  close: () => void;
};

/**
 * Shared behaviour for the morphing modals.
 *
 * Owns the GSAP timeline that grows a panel out of the card that was clicked
 * and shrinks it back, plus the dialog plumbing around it: body-scroll lock,
 * Escape to close, a Tab/Shift+Tab focus trap, and returning focus to the
 * trigger element afterwards.
 *
 * Generic over the record being displayed, so ProjectModal gets a ModalProject
 * back out and CertificateModal gets a Certificate — the hook never widens
 * either to a shared shape.
 */
export const useMorphModal = <T,>({
  item,
  originRect,
  onClose,
  variant = "scale-morph",
  speed = "normal",
  closeOnEscape = true,
}: UseMorphModalOptions<T>): UseMorphModalResult<T> => {
  const [render, setRender] = useState<T | null>(item);

  const originRef = useRef<DOMRect | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const duration = SPEED_MS[speed] / 1000;

  const close = useCallback(() => {
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
      lastFocusedRef.current?.focus();
      onClose?.();
    };

    const origin = originRef.current;
    if (variant === "scale-morph" && origin) {
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
        scale: variant === "fade" ? 1 : 0.92,
        opacity: 0,
        duration: duration * 0.8,
        ease: "power2.in",
        onComplete: finish,
      });
    }
  }, [variant, duration, onClose]);

  // Open: when a new item arrives, capture the origin rect + the element that
  // had focus, then render it.
  useEffect(() => {
    if (item) {
      originRef.current = originRect ?? null;
      // Only an HTMLElement can be refocused on close; SVG and other elements
      // are ignored rather than optional-called on a method that may not exist.
      const active = document.activeElement;
      lastFocusedRef.current = active instanceof HTMLElement ? active : null;
      setRender(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

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
    if (variant === "scale-morph" && origin) {
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
        scale: variant === "fade" ? 1 : 0.92,
        opacity: 0,
        transformOrigin: "center center",
      });
      gsap.set(contentRef.current, { opacity: 1 });
      tweenRef.current = gsap.to(panel, { scale: 1, opacity: 1, duration, ease: "power3.out" });
    }

    closeBtnRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  // Lock body scroll + Escape handling and focus trap while the modal is open.
  useEffect(() => {
    if (!render) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        close();
        return;
      }

      // Trap focus inside the dialog so Tab/Shift+Tab can't reach the page
      // behind the still-visible modal.
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
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
  }, [render, closeOnEscape, close]);

  return { render, panelRef, backdropRef, contentRef, closeBtnRef, close };
};
