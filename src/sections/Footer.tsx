import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { resolveSocialIcon, socialHref } from "../constants/socialIcons";
import { useSocialMedia } from "../hooks/resources";

const Footer = () => {
  const { data: socials } = useSocialMedia();

  const socialImgs = useMemo(
    () =>
      socials.map((s) => ({
        name: s.name,
        link: socialHref(s.url, `${s.name} ${s.icon}`),
        icon: resolveSocialIcon(s.icon),
      })),
    [socials]
  );

  return (
    <footer className="footer reveal">
      <div className="footer-container">
        <div className="flex flex-col justify-center">
          <p>📍 Currently in India</p>
        </div>
        <div className="socials">
          {socialImgs.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="btn btn-icon"
            >
              <FontAwesomeIcon icon={s.icon} size="1x" />
            </a>
          ))}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Deepak Singh Rajput
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
