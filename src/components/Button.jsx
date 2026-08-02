const Button = ({
  variant = "primary",
  text,
  children,
  href,
  scrollTo,
  onClick,
  className = "",
  "aria-label": ariaLabel,
  target,
  rel,
}) => {
  const handleClick = (e) => {
    if (onClick) { onClick(e); return; }
    if (scrollTo) {
      e.preventDefault();
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const Tag = href ? "a" : "button";
  const linkProps = href ? { href, target, rel } : {};

  return (
    <Tag
      {...linkProps}
      onClick={handleClick}
      className={`btn btn-${variant} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {children ?? text}
    </Tag>
  );
};

export default Button;
