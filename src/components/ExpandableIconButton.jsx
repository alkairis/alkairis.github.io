import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const ExpandableIconButton = ({
  icon,
  text,
  href,
  onClick,
  target,
  className = "",
  iconClassName = "",
}) => {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      aria-label={text}
      className={clsx(
        `
        group
        relative

        inline-flex
        items-center

        h-11
        px-0 hover:px-4

        rounded-full
        overflow-hidden

        border border-border
        bg-background

        shadow-sm
        hover:shadow-md

        transition-all
        duration-300
        ease-in-out

        active:scale-95
      `,
        className
      )}
    >
      {/* Icon */}
      <div
        className="
          flex items-center justify-center

          w-11 h-11
          shrink-0
        "
      >
        <FontAwesomeIcon
          icon={icon}
          className={clsx(
            `
            w-7 h-7

            text-muted-foreground
            group-hover:text-foreground

            transition-colors
            duration-300
          `,
            iconClassName
          )}
        />
      </div>

      {/* Expandable Text */}
      <span
        className="
          max-w-0
          overflow-hidden
          whitespace-nowrap

          opacity-0

          text-sm
          font-medium
          text-foreground

          transition-all
          duration-300
          ease-in-out

          group-hover:max-w-[200px]
          group-hover:opacity-100
        "
      >
        {text}
      </span>
    </Component>
  );
};

export default ExpandableIconButton;