"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const approachData = [
  {
    id: "01",
    title: "Our Mission",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
  },
  {
    id: "02",
    title: "Our Vision",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
  },
  {
    id: "03",
    title: "Our Mission",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
  },
  {
    id: "04",
    title: "Our Vision",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
  },
];

const OurApproach = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Description fade up
      gsap.fromTo(
        ".approach-description",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".approach-description",
            start: "top 85%",
            once: true,
          },
        },
      );

      // Approach cards: staggered blur-to-clear + fade up
      gsap.fromTo(
        ".approach-card",
        { y: 40, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".approach-grid",
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-primary">
      <Bounded>
        <section ref={sectionRef} className="py-24">
          <div className="flex items-start gap-24">
            <div className="shrink-0 pt-2">
              <TitleTag tag="Our Apprach" dark />
            </div>
            <div className="w-full space-y-20 ">
              {/* Description */}
              <p className="approach-description font-archivo text-[30px] font-normal leading-9 text-white/50">
                ZETA System of Smartlearning exists to provide clarity. We work
                closely with students to understand their background and goals,{" "}
                <span className="font-semibold text-white">
                  then guide them through the process in a structured,
                  straightforward way.
                </span>
              </p>

              {/* Approach grid */}
              <div className="approach-grid grid grid-cols-1 gap-x-24 gap-y-24 md:grid-cols-2">
                {approachData.map((item) => (
                  <div
                    key={item.id}
                    className="approach-card space-y-4 border-b border-white/10 pb-8"
                  >
                    <p className="font-archivo text-[40px] font-bold leading-12 text-secondary">
                      {item.id}
                    </p>
                    <h3 className="font-archivo text-[20px] font-bold leading-7 text-white">
                      {item.title}
                    </h3>
                    <p className="font-inter text-[14px] leading-5.5 text-white/60">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Bounded>
    </div>
  );
};

export default OurApproach;
