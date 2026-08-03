import { useEffect, useState } from "react";
import { getResumeUrl } from "../api/api";

// Module-level cache so the resume URL is fetched once and shared across every
// CTA that offers it (hero, navbar, contact) instead of one request each.
let cachedUrl = "";
let inFlight = null;

const loadResumeUrl = () => {
  if (cachedUrl) return Promise.resolve(cachedUrl);
  if (!inFlight) {
    inFlight = getResumeUrl()
      .then((url) => {
        if (url) cachedUrl = url;
        return cachedUrl;
      })
      .catch(() => cachedUrl)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};

/**
 * Backend-managed resume URL. Returns "" until it resolves; consumers should
 * treat an empty value as "not ready yet" and hide/disable the CTA.
 */
export const useResumeUrl = () => {
  const [resumeUrl, setResumeUrl] = useState(cachedUrl);

  useEffect(() => {
    let active = true;
    loadResumeUrl().then((url) => {
      if (active && url) setResumeUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

  return resumeUrl;
};
