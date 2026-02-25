"use client";

import PageTitleSVG from "@/components/sharedIcons/PageTitleSVG";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface ProcessCardProps {
  id: string;
  title: string;
  points: string[];
}

const ProcessCard: React.FC<ProcessCardProps> = ({ id, title, points }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="group bg-secondary-50 rounded-[16px] border-2 border-secondary-300 border-dotted p-[32px] h-full transition-all duration-500 hover:border-secondary  hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] cursor-default overflow-hidden relative"
    >
      {/* Background decorative element */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-500" />

      <div className="relative inline-block mb-32">
        {/* Border Box (Bottom Layer) */}
        <div className="absolute top-2 left-2 w-18 h-18 rounded-[12px] border-2 border-primary-100/50 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />

        {/* Number Badge (Top Layer) */}
        <div
          ref={badgeRef}
          className="relative w-18 h-18 rounded-[12px] bg-secondary-200 flex items-center justify-center z-10 group-hover:bg-secondary group-hover:scale-110 transition-all duration-500"
        >
          <h3 className="text-secondary-900 font-archivo text-[36px] leading-[40px] font-normal group-hover:text-white transition-colors duration-500">
            {id}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-[20px] relative z-20">
        <h2 className="font-archivo text-[36px] leading-[40px] font-semibold text-primary-400 group-hover:text-secondary transition-colors duration-500">
          {title}
        </h2>

        <ul className="space-y-[16px]">
          {points.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-4 group/item translate-x-0 hover:translate-x-2 transition-transform duration-300"
            >
              <PageTitleSVG className="h-[32px] w-[32px] text-secondary shrink-0 mt-[3px] group-hover/item:scale-110 transition-transform duration-300" />
              <span className="font-archivo text-[20px] leading-[30px] text-primary-300 group-hover:text-primary transition-colors duration-500">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProcessCard;

