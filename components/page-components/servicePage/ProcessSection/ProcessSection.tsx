"use client";

import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";
import React, { useEffect, useRef } from "react";
import ProcessCard from "./ProcessCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useHeadingSection } from "@/lib/hooks/pages/services/useServiceSections";
import ProcessSectionSkeleton from "./ProcessSectionSkeleton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const processData = [
  {
    id: "01",
    title: "Initial Consultation",
    points: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
      "Ipsum dolor sit amet, consectetur adipiscing elite. Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
    ],
  },
  {
    id: "02",
    title: "Exploring Suitable Pathways",
    points: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
      "Ipsum dolor sit amet, consectetur adipiscing elite. Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
    ],
  },
  {
    id: "03",
    title: "Application Preparation",
    points: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
      "Ipsum dolor sit amet, consectetur adipiscing elite. Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
    ],
  },
  {
    id: "04",
    title: "Review & Submission",
    points: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
      "Ipsum dolor sit amet, consectetur adipiscing elite. Lorem ipsum dolor sit amet, consectetur adipiscing elite.",
    ],
  },
];

const ProcessSection = () => {
  const { isLoading } = useHeadingSection();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // Tag animation
      if (tagRef.current) {
        tl.from(tagRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Title animation (split text effect)
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll(".char");
        tl.from(
          chars,
          {
            y: 50,
            opacity: 0,
            rotateX: -45,
            duration: 1,
            stagger: 0.02,
            ease: "back.out(1.7)",
          },
          "-=0.6",
        );
      }

      // Description animation
      if (descRef.current) {
        tl.from(
          descRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.7",
        );
      }

      // Cards animation
      tl.from(
        ".process-card-item",
        {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 1,
          stagger: 0.2,
          ease: "power4.out",
        },
        "-=0.5",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const renderSplitTitle = (text: string) => {
    return text.split(" ").map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap">
        {word.split("").map((char, charIndex) => (
          <span key={charIndex} className="char inline-block">
            {char}
          </span>
        ))}
        <span className="inline-block">&nbsp;</span>
      </span>
    ));
  };

  if (isLoading) {
    return <ProcessSectionSkeleton />;
  }

  return (
    <div ref={containerRef}>
      <Bounded className="py-[100px]">
        {/* title part */}
        <div className="flex items-end justify-between pb-[70px]">
          <div className="space-y-[20px]">
            <div ref={tagRef}>
              <TitleTag tag={"Process"} className={"text-secondary"} />
            </div>
            <h2
              ref={titleRef}
              className="text-primary font-semibold font-archivo text-[60px] leading-[70px] overflow-hidden"
            >
              {renderSplitTitle("How it Works")}
            </h2>
          </div>

          <p
            ref={descRef}
            className="text-primary-300 font-inter text-[16px] leading-[22px] font-normal max-w-[482px]"
          >
            Hear what our clients say about their experience working with us and
            how our solutions helped them achieve real results.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
          {processData.map((item) => (
            <div key={item.id} className="process-card-item">
              <ProcessCard
                id={item.id}
                title={item.title}
                points={item.points}
              />
            </div>
          ))}
        </div>
      </Bounded>
    </div>
  );
};

export default ProcessSection;
