import { useEffect, useState } from "react";
import {
  getAbout,
  getCertificates,
  getProfessionalExperience,
  getProjects,
  getSocialMedia,
  getTechnicalSkills,
} from "../api/api";

/**
 * Builds a hook around a single GET endpoint: a module-level cache, one shared
 * in-flight request no matter how many components ask for it at once, and a
 * loading flag so callers can tell "still fetching" from "there is nothing".
 *
 * Every data-driven section used to carry its own copy of this effect, which
 * meant three components fetching the social links separately on one page
 * load. Same caching approach as useResumeUrl, which predates this.
 *
 * `emptyValue` is what callers see before the request resolves and if it
 * fails — [] for list endpoints, null for single records.
 */
const createResourceHook = (fetcher, emptyValue) => {
  let cached = null;
  let inFlight = null;

  const load = () => {
    if (cached !== null) return Promise.resolve(cached);
    if (!inFlight) {
      inFlight = fetcher()
        .then((data) => {
          cached = data;
          return cached;
        })
        // Leave `cached` null on failure so a later mount retries rather than
        // caching the failure for the life of the page.
        .catch(() => emptyValue)
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };

  // Named rather than anonymous so the react-hooks lint rules recognise it.
  return function useResource() {
    const [data, setData] = useState(cached ?? emptyValue);
    const [loading, setLoading] = useState(cached === null);

    useEffect(() => {
      let active = true;
      load()
        .then((value) => {
          if (active) setData(value);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []);

    return { data, loading };
  };
};

export const useAbout = createResourceHook(getAbout, null);
export const useCertificates = createResourceHook(getCertificates, []);
export const useExperience = createResourceHook(getProfessionalExperience, []);
export const useProjects = createResourceHook(getProjects, []);
export const useSocialMedia = createResourceHook(getSocialMedia, []);
export const useTechnicalSkills = createResourceHook(getTechnicalSkills, []);
