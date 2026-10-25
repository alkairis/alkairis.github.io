import { useMemo } from "react";
import { buildCorpus } from "../lib/corpus";
import { SearchIndex } from "../lib/retrieval";
import { useSiteData } from "./useSiteData";

/**
 * BM25 index over everything the site renders. Rebuilt only when a data source
 * actually changes (fallback → live API data), which is a handful of times per
 * visit at most; a build over ~50 chunks takes well under a millisecond.
 */
export const useSearchIndex = (): SearchIndex => {
  const data = useSiteData();
  const { about, roles, education, featured, moreProjects, skills, certificates, achievements, posts, years, email, resumeUrl } =
    data;

  return useMemo(
    () => new SearchIndex(buildCorpus(data)),
    // `data` is a fresh object each render; its parts are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [about, roles, education, featured, moreProjects, skills, certificates, achievements, posts, years, email, resumeUrl]
  );
};
