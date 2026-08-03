import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import TitleHeader from "../components/TitleHeader";
import CertificateModal from "../components/CertificateModal";
import { getCertificates } from "../api/api";
import { fallbackCertificates } from "../constants/fallbacks";

gsap.registerPlugin(ScrollTrigger);

const Certificates = () => {
  const sectionRef = useRef(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState(null);
  const [originRect, setOriginRect] = useState(null);

  useEffect(() => {
    let active = true;
    getCertificates()
      .then((data) => {
        if (active) setCertifications(data);
      })
      .catch(() => {
        if (active) setCertifications([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Show static credentials rather than an empty grid while the backend cold
  // starts or if it returns nothing.
  const visibleCertificates = certifications.length
    ? certifications
    : fallbackCertificates;

  const openCert = (cert, e) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setActiveCert(cert);
  };

  const cardProps = (cert) => ({
    role: "button",
    tabIndex: 0,
    "aria-haspopup": "dialog",
    "aria-label": `View details for ${cert.name}`,
    onClick: (e) => openCert(cert, e),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCert(cert, e);
      }
    },
  });

  useGSAP(() => {
    gsap.utils.toArray(".cert-card").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.08 * i,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });
  }, { scope: sectionRef, dependencies: [visibleCertificates, loading] });

  return (
    <section id="certifications" ref={sectionRef} className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Professional Certifications"
          sub="🎓📜 Credentials"
        />

        <div className="grid-2-cols mt-16 max-w-[960px] mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="cert-skeleton arctic-glow-card skeleton-card"
                >
                  <div className="skeleton skeleton--circle cert-skeleton-logo" />
                  <div className="cert-skeleton-body">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              ))
            : visibleCertificates.map((cert) => (
            <div
              key={cert.id}
              className="cert-card arctic-glow-card"
              {...cardProps(cert)}
            >
              <div className="cert-logo">
                <img src={cert.image} alt={`${cert.organization} logo`} loading="lazy" />
              </div>

              <div className="cert-body">
                <h3 className="cert-name">{cert.name}</h3>
                <p className="cert-org">{cert.organization}</p>
                <p className="cert-date">
                  Issued {cert.issueDate}
                  {cert.expiryDate && ` · Expires ${cert.expiryDate}`}
                </p>
              </div>

              <span className="cert-arrow" aria-hidden="true">
                &#8599;
              </span>
            </div>
              ))}
        </div>
      </div>

      <CertificateModal
        certificate={activeCert}
        originRect={originRect}
        onClose={() => setActiveCert(null)}
        closeOnEscape
        closeOnBackdrop
      />
    </section>
  );
};

export default Certificates;
