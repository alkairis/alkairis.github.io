import { useEffect, useState } from "react";
import { getProjects } from "../api/api";

// Module-level cache, shared by the showcase section and the hero. Same
// pattern as useResumeUrl.
let cached = null;
let inFlight = null;

const loadProjects = () => {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = getProjects()
      .then((list) => {
        cached = list;
        return cached;
      })
      // Leave `cached` null on failure so a later mount retries.
      .catch(() => [])
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};

/**
 * Shared project list.
 *
 * Returns `loading` alongside the list so callers can tell "still fetching"
 * from "there are none" — the hero needs that distinction to decide whether
 * to render its "View My Work" CTA, since the section that CTA scrolls to
 * doesn't render when there are no projects.
 */
export const useProjects = () => {
  const [projects, setProjects] = useState(cached ?? []);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let active = true;
    loadProjects()
      .then((list) => {
        if (active) setProjects(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { projects, loading };
};
