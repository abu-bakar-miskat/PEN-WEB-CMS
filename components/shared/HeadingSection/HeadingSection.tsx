"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import TitleTag from "../TitleTag";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type HeadingProp = {
  tag: string;
  title: string;
  subTitle?: string;
  details?: string;
  dark?: boolean;
  alignEnd?: boolean;
};

const HeadingSection = ({
  tag,
  title,
  subTitle,
  details,
  dark = false,
  alignEnd = false,
}: HeadingProp) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLParagraphElement>(null);
  const detailsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });

      // Title tag animation
      tl.from(".title-tag-wrapper", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Split text animation for h2
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll(".char");
        tl.from(
          chars,
          {
            y: 60,
            opacity: 0,
            rotateX: -45,
            duration: 1,
            stagger: 0.02,
            ease: "back.out(1.7)",
          },
          "-=0.6"
        );
      }

      // fade-in animation for p tags
      if (subTitleRef.current) {
        tl.from(
          subTitleRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }

      if (detailsRef.current) {
        tl.from(
          detailsRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Split title into characters while preserving words for proper line breaking
  const renderSplitTitle = (text: string) => {
    return text.split(" ").map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split("").map((char, charIndex) => (
          <span key={charIndex} className="char inline-block">
            {char}
          </span>
        ))}
        {/* Add space after word, but not after the last word */}
        <span className="inline-block">&nbsp;</span>
      </span>
    ));
  };

  return (
    <div ref={containerRef}>
      {/* left content */}
      <div className="space-y-[20px] ">
        {/* title tag  */}
        <div className="title-tag-wrapper">
          <TitleTag tag={tag} dark={dark} />
        </div>

        {/* Heading part  */}
        <div
          className={`w-full flex ${alignEnd ? "items-end" : "items-center"} justify-between gap-[28px] `}
        >
          <div className="space-y-[20px]">
            <h2
              ref={titleRef}
              className={`${dark ? "text-white" : "text-primary"} font-archivo text-[60px] leading-[70px] font-bold overflow-hidden`}
            >
              {renderSplitTitle(title)}
            </h2>
            {subTitle && (
              <p
                ref={subTitleRef}
                className={`w-full ${details ? "max-w-[670px]" : "max-w-[976px]"} ${dark ? "text-secondary/70" : "text-primary-400"} font-archivo text-[30px] leading-[40px] font-semibold`}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subTitle}{" "}
              </p>
            )}
          </div>

          {/* right content  */}
          {details && (
            <div className="w-full max-w-[480px]">
              <p
                ref={detailsRef}
                className={`${dark ? "text-primary-50" : "text-primary"} font-inter text-[16px] leading-[24px] font-normal`}
              >
                {details}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadingSection;
