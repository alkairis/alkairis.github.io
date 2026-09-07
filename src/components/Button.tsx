import type { MouseEvent, ReactNode } from "react";
import type { ButtonVariant } from "../types/ui";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  /** Label, when no children are given. `children` wins if both are present. */
  text?: string;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

type ButtonAsAnchor = ButtonBaseProps & {
  /** Renders an <a>. Mutually exclusive with `scrollTo`. */
  href: string;
  target?: string;
  rel?: string;
  scrollTo?: never;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: never;
  target?: never;
  rel?: never;
  /** id of the element to smooth-scroll to on click. */
  scrollTo?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type ButtonProps = ButtonAsAnchor | ButtonAsButton;

/**
 * Renders an <a> when `href` is set and a <button> otherwise. The union above
 * is what keeps the two halves from being mixed — `target` on a scroll button,
 * or `scrollTo` on a link, is now a compile error rather than a silently
 * ignored prop.
 */
const Button = (props: ButtonProps) => {
  const {
    variant = "primary",
    text,
    children,
    className = "",
    "aria-label": ariaLabel,
  } = props;

  const classes = `btn btn-${variant} ${className}`.trim();
  const content = children ?? text;

  if (props.href !== undefined) {
    const { href, target, rel, onClick } = props;
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  const { scrollTo, onClick } = props;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
      return;
    }
    if (scrollTo) {
      event.preventDefault();
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    // type="button" is deliberate: without it a <button> defaults to "submit",
    // so dropping this component inside a <form> would submit the form.
    <button type="button" onClick={handleClick} className={classes} aria-label={ariaLabel}>
      {content}
    </button>
  );
};

export default Button;
