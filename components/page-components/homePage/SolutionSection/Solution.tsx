"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import SolutionCard, { SolutionItem } from "./SolutionCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const solutionData: SolutionItem[] = [
  {
    id: "1",
    title: "Top reason to study in UK",
    description:
      "How do you create compelling presentations that wow your colleagues and impress your managers?",
  },
  {
    id: "2",
    title: "Application made simple",
    description:
      "How do you create compelling presentations that wow your colleagues and impress your managers?",
  },
  {
    id: "3",
    title: "Application made simple",
    description:
      "How do you create compelling presentations that wow your colleagues and impress your managers?",
  },
  {
    id: "4",
    title: "Application made simple",
    description:
      "How do you create compelling presentations that wow your colleagues and impress your managers?",
  },
];

const Solution = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(".solution-item", { y: 50, opacity: 0 });
      gsap.to(".solution-item", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".solution-grid",
          start: "top 85%",
        },
      });

      gsap.set(".solution-center", { y: 60, opacity: 0 });
      gsap.to(".solution-center", {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".solution-grid",
          start: "top 85%",
        },
      });

      // Parallax: image shifts slightly on scroll
      gsap.to(".solution-center-img", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".solution-center",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-primary">
      <Bounded>
        <div className="py-25">
          <HeadingSection
            tag="Solution"
            title=" What we deliver"
            details="ZETA System of Smartlearning exists to provide clarity. We work
                closely with students to understand their background and goals,
                then guide them through the process in a structured,
                straightforward way."
            dark
          />

          {/* Grid: left cards | center image | right cards */}
          <div className="solution-grid grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr_1fr] pt-18">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <div className="solution-item flex-1 flex">
                <SolutionCard item={solutionData[0]} />
              </div>
              <div className="solution-item flex-1 flex">
                <SolutionCard item={solutionData[2]} />
              </div>
            </div>

            {/* Center image */}
            <div className="solution-center relative min-h-[640px] overflow-hidden rounded-2xl">
              <Image
                src="/home/solution-center.png"
                alt="Students walking together"
                fill
                className="solution-center-img object-cover scale-[1.2]"
              />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <div className="solution-item flex-1 flex">
                <SolutionCard item={solutionData[1]} />
              </div>
              <div className="solution-item flex-1 flex">
                <SolutionCard item={solutionData[3]} />
              </div>
            </div>
          </div>
        </div>
      </Bounded>
    </section>
  );
};

export default Solution;
