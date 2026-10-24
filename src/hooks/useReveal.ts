import { useEffect } from "react";

/**
 * Scroll reveal for elements marked `data-reveal`. Content is visible by
 * default; the hidden start state only applies once `js-reveal` is on <html>,
 * so a failed script or reduced-motion setting never hides anything.
 * A MutationObserver picks up elements that render after data arrives.
 */
export const useReveal = () => {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // An attribute React doesn't manage: a class would be wiped the
            // next time the element's className re-renders (e.g. a toggle).
            entry.target.setAttribute("data-in", "");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const scan = (scope: ParentNode) =>
      scope.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));

    scan(document);
    const mo = new MutationObserver((records) => {
      records.forEach((r) =>
        r.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches("[data-reveal]")) io.observe(node);
            scan(node);
          }
        })
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);
};
