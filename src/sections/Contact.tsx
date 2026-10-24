import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sendContact } from "../api/api";
import { ArrowRight, Check, Copy } from "../components/Icons";
import { profile } from "../content/profile";
import { useSiteData } from "../hooks/useSiteData";

type Status = "idle" | "sending" | "sent" | "error";

type ContactProps = {
  /** "card" is the closing block on /resume: no form, no section number. */
  variant?: "section" | "card";
};

const Contact = ({ variant = "section" }: ContactProps) => {
  const isCard = variant === "card";
  const { email, links } = useSiteData();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email.display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = email.href;
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await sendContact(form);
      setForm({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id={isCard ? "hire" : "contact"}
      className={isCard ? "resume-hire" : "section"}
      aria-labelledby={isCard ? "hire-title" : "contact-title"}
    >
      <div className={isCard ? undefined : "container"}>
        <div className={`contact${isCard ? " contact--card" : ""}`} data-reveal>
          <div className="contact-orb" aria-hidden="true" />

          <div className="contact-main">
            <p className="eyebrow">
              {!isCard && (
                <>
                  <span className="section-index">07</span>
                  <span className="section-rule" aria-hidden="true" />
                </>
              )}
              Contact
            </p>
            <h2 id={isCard ? "hire-title" : "contact-title"} className="contact-title">
              Hiring for GenAI or <span className="serif accent-text">LLM platform</span> work?
            </h2>

            {email ? (
              <div className="contact-email">
                <a href={email.href} className="contact-address">
                  {email.display}
                </a>
                <button type="button" className="btn btn-primary btn-sm" onClick={copy} aria-live="polite">
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy email"}
                </button>
              </div>
            ) : isCard ? (
              <p className="contact-fallback">
                <Link to="/#contact" className="link-u">
                  Leave a note
                </Link>{" "}
                — it lands straight in my inbox.
              </p>
            ) : (
              <p className="contact-fallback">Leave a note below — it lands straight in my inbox.</p>
            )}

            <ul className="contact-links">
              {links.map((l) => (
                <li key={l.id}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-u">
                    <FontAwesomeIcon icon={l.icon} /> {l.label}
                  </a>
                </li>
              ))}
              <li>
                {isCard ? (
                  <Link to="/#work" className="link-u">
                    Selected work
                  </Link>
                ) : (
                  <Link to="/resume" className="link-u">
                    Resume
                  </Link>
                )}
              </li>
            </ul>

            <p className="contact-avail">
              <span className="live-dot" aria-hidden="true" />
              <span>
                {profile.availability}. {profile.availabilityDetail}.
              </span>
            </p>
          </div>

          {!isCard && (
            <form className="contact-form" onSubmit={submit}>
              <p className="contact-form-title">Or leave a note</p>
              <label>
                <span>Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  disabled={status === "sending"}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  disabled={status === "sending"}
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="The role, the team, the problem…"
                  disabled={status === "sending"}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send"} <ArrowRight />
              </button>
              <p className={`contact-status is-${status}`} role="status">
                {status === "sent" && "Thanks — I'll reply within a day."}
                {status === "error" && "That didn't go through. Email or LinkedIn will reach me."}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
