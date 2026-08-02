import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faClock, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import TitleHeader from "../components/TitleHeader";
import { getSocialMedia, sendContact } from "../api/api";
import {
  resolveSocialIcon,
  socialHref,
  socialDisplayValue,
  isContactMethod,
} from "../constants/socialIcons";

gsap.registerPlugin(ScrollTrigger);

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const Contact = () => {
  const formRef = useRef(null);
  const sectionRef = useRef(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    let active = true;
    getSocialMedia()
      .then((data) => {
        if (active) setSocials(data);
      })
      .catch(() => {
        if (active) setSocials([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Only email, contact number and LinkedIn are shown as contact methods here.
  const contactMethods = useMemo(
    () =>
      socials.filter(isContactMethod).map((s) => ({
        id: s.id,
        icon: resolveSocialIcon(s.icon),
        label: s.name,
        value: socialDisplayValue(s.url),
        href: socialHref(s.url, `${s.name} ${s.icon}`),
      })),
    [socials]
  );

  useGSAP(() => {
    const formPanel = sectionRef.current?.querySelector(".contact-form-panel");
    const infoPanel = sectionRef.current?.querySelector(".contact-info-panel");

    if (formPanel) {
      gsap.fromTo(
        formPanel,
        { x: -45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
          },
        }
      );
    }

    if (infoPanel) {
      gsap.fromTo(
        infoPanel,
        { x: 45, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
          },
        }
      );
    }

    const contactCards = gsap.utils.toArray(".contact-method-card", sectionRef.current);
    if (contactCards.length) {
      gsap.fromTo(
        contactCards,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }
  }, { scope: sectionRef, dependencies: [contactMethods] });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(STATUS.LOADING);

    try {
      await sendContact(form);
      setForm({ name: "", email: "", message: "" });
      setStatus(STATUS.SUCCESS);
      setTimeout(() => setStatus(STATUS.IDLE), 5000);
    } catch (error) {
      console.error("Contact send error:", error);
      setStatus(STATUS.ERROR);
      setTimeout(() => setStatus(STATUS.IDLE), 5000);
    }
  };

  const isLoading = status === STATUS.LOADING;

  return (
    <section id="contact" ref={sectionRef} className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Get in Touch – Let's Connect"
          sub="💬 Have questions or ideas? Let's talk! 🚀"
        />

        <div className="grid-12-cols mt-16">

          {/* ── Contact form ── */}
          <div className="xl:col-span-5 contact-form-panel">
            <div className="arctic-glow-card rounded-xl p-8 md:p-10 flex flex-col gap-0">

              {status === STATUS.SUCCESS && (
                <div className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#15803d" }}>
                  <span>✅</span>
                  <span>Message sent! I'll get back to you soon.</span>
                </div>
              )}

              {status === STATUS.ERROR && (
                <div className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "#dc2626" }}>
                  <span>❌</span>
                  <span>Something went wrong. Please try again or email me directly.</span>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col gap-7">
                <div>
                  <label htmlFor="name">Your name</label>
                  <input type="text" id="name" name="name" value={form.name}
                    onChange={handleChange} placeholder="What's your good name?"
                    required disabled={isLoading} />
                </div>
                <div>
                  <label htmlFor="email">Your Email</label>
                  <input type="email" id="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="What's your email address?"
                    required disabled={isLoading} />
                </div>
                <div>
                  <label htmlFor="message">Your Message</label>
                  <textarea id="message" name="message" value={form.message}
                    onChange={handleChange} placeholder="How can I help you?"
                    rows="5" required disabled={isLoading} />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full overflow-hidden leading-[1.25] btn btn-primary transition-all duration-300 active:scale-[0.98] ${
                    isLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="block h-[1.25em] w-full overflow-hidden">
                    <span className={`flex flex-col transition-transform duration-300 ease-in-out ${
                      isLoading ? "" : "translate-y-0 group-hover:-translate-y-1/2"
                    }`}>
                      <span className="flex h-[1.25em] w-full shrink-0 items-center justify-center font-medium">
                        {isLoading ? "Sending…" : "Send Message"}
                      </span>
                      <span className="flex h-[1.25em] w-full shrink-0 items-center justify-center">
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                        />
                      </span>
                    </span>
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="xl:col-span-7 flex flex-col justify-center gap-8 contact-info-panel">

            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#0f172a] leading-tight">
                Let's build something<br />
                <span style={{ color: "#0ea5e9" }}>great together.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed max-w-md"
                style={{ color: "rgba(15,23,42,0.55)" }}>
                Whether you have a project in mind, a question about my work,
                or just want to say hello — my inbox is always open.
              </p>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full w-fit"
              style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)" }}>
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium" style={{ color: "rgba(15,23,42,0.65)" }}>
                Open to opportunities
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {contactMethods.map((m) => (
                <a
                  key={m.id}
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-method-card group arctic-glow-card rounded-xl px-5 py-4 flex items-center gap-4
                    transition-all duration-200 hover:-translate-y-0.5 no-underline"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-colors duration-200"
                    style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}>
                    <FontAwesomeIcon icon={m.icon} className="w-4 h-4" style={{ color: "#0ea5e9" }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                      style={{ color: "rgba(15,23,42,0.4)" }}>{m.label}</p>
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{m.value}</p>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#0ea5e9" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(15,23,42,0.5)" }}>
                <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5" style={{ color: "#0ea5e9" }} />
                <span>India (IST · UTC+5:30)</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(15,23,42,0.5)" }}>
                <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" style={{ color: "#0ea5e9" }} />
                <span>Usually replies within 24 hours</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
