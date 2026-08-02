import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const DownloadButton = ({
  variant = "primary",
  text = "Download",
  href,
  onClick,
  className = "",
}) => {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      download
      className={clsx(
        `
        group
        relative
        inline-flex
        min-w-[10rem]
        overflow-hidden
        leading-[1.25]

        btn btn-${variant}

        transition-all
        duration-300

        active:scale-95
      `,
        className
      )}
    >
      {/* Sliding Content */}
      <span
        className="
          block
          h-[1.25em]
          w-full
          overflow-hidden
        "
      >
        <span
          className="
            flex
            flex-col
            transition-transform
            duration-300
            ease-in-out
            translate-y-0
            group-hover:-translate-y-1/2
          "
        >
          {/* Text State */}
          <span
            className="
              flex
              h-[1.25em]
              w-full
              shrink-0
              items-center
              justify-center
              font-medium
            "
          >
            {text}
          </span>

          {/* Icon State */}
          <span
            className="
              flex
              h-[1.25em]
              w-full
              shrink-0
              items-center
              justify-center
            "
          >
            <FontAwesomeIcon
              icon={faDownload}
              className="
                h-4
                w-4

                transition-transform
                duration-300

                group-hover:scale-110
              "
            />
          </span>
        </span>
      </span>
    </Component>
  );
};

export default DownloadButton;
