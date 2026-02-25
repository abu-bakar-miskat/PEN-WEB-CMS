import React from "react";
import clsx from "clsx";
import PageTitleSVG from "../sharedIcons/PageTitleSVG";

interface TitleTagProps {
  tag: string;
  className?: string;
  dark?: boolean;
}

const TitleTag: React.FC<TitleTagProps> = ({ tag, className, dark = false }) => {
  return (
    <div className="flex items-center gap-[16px]">
      <PageTitleSVG className="h-[42px] w-[42px]" />
      <h2
        className={clsx(
          "font-archivo font-semibold text-[24px] leading-[32px]",
          dark ? "text-secondary" : "text-primary",
          className,
        )}
      >
        {tag}
      </h2>
    </div>
  );
};

export default TitleTag;
