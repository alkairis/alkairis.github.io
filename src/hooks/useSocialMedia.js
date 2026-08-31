import { useEffect, useState } from "react";
import { getSocialMedia } from "../api/api";

// Module-level cache so the social links are fetched once and shared by every
// consumer (hero, contact, footer) instead of one request each. Same pattern
// as useResumeUrl.
let cached = null;
let inFlight = null;

const loadSocialMedia = () => {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = getSocialMedia()
      .then((list) => {
        cached = list;
        return cached;
      })
      // Leave `cached` null on failure so a later mount retries rather than
      // caching the empty result forever.
      .catch(() => [])
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};

/** Social/contact links from the backend. Empty until the request resolves. */
export const useSocialMedia = () => {
  const [socials, setSocials] = useState(cached ?? []);

  useEffect(() => {
    let active = true;
    loadSocialMedia().then((list) => {
      if (active) setSocials(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return socials;
};
