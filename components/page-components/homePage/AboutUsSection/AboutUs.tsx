"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import CountUp from "@/components/shared/Animation/CountUp";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import { useAboutUs } from "@/lib/hooks/pages/home/useAboutUs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  value: string;
  description: string;
}

const defaultStats: StatItem[] = [
  {
    value: "15+",
    description: "We have 15 agents",
  },
  {
    value: "100+",
    description: "We are engaged with 100+ partners",
  },
  {
    value: "10k",
    description: "We have more than 10k students",
  },
];

const AboutUs = () => {
  const { data: aboutUs } = useAboutUs();
  const sectionRef = useRef<HTMLElement>(null);

  const fields = aboutUs?.content?.fields ?? [];

  const tag = fields.find((f: { name: string }) => f.name === "Tag");
  const title = fields.find((f: { name: string }) => f.name === "Title");
  const details = fields.find((f: { name: string }) => f.name === "Details");
  const description = fields.find(
    (f: { name: string }) => f.name === "Description",
  );
  const statsField = fields.find((f: { name: string }) => f.name === "Stats");
  const numberFieldId = statsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Number",
  )?.id;
  const descFieldId = statsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Description",
  )?.id;
  const stats: StatItem[] =
    statsField?.value?.map((entry: Record<string, string>) => ({
      value: numberFieldId ? (entry[numberFieldId] ?? "") : "",
      description: descFieldId ? (entry[descFieldId] ?? "") : "",
    })) ?? defaultStats;

  useEffect(() => {
    if (!sectionRef.current) return;

    // Delay setup to ensure layout is stable after scroll restoration
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      const ctx = gsap.context(() => {
        // Description text: slide up with fade
        gsap.fromTo(
          ".about-description",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".about-description",
              start: "top 85%",
              once: true,
            },
          },
        );

        // Divider line: scale from left
        gsap.fromTo(
          ".about-divider",
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: ".about-divider",
              start: "top 90%",
              once: true,
            },
          },
        );

        // Stats: staggered entrance
        gsap.fromTo(
          ".about-stat",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".about-stats-grid",
              start: "top 85%",
              once: true,
            },
          },
        );
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef}>
      <Bounded>
        <div className="py-24">
          {/* Header Row */}
          <div className="about-heading">
            <HeadingSection
              tag={tag?.value ?? "About us"}
              title={title?.value ?? "About us"}
              details={
                details?.value ??
                "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way."
              }
            />
          </div>

          <div className="pl-18">
            {/* Description */}
            <p className="about-description mt-16 text-[30px] leading-10 font-semibold text-primary font-archivo">
              {description?.value ??
                "Situated strategically in the vibrant city of London, William College is dedicated to offering an inclusive and dynamic learning experience. We pride ourselves on fostering a nurturing and engaging educational environment that encourages personal and academic growth."}
            </p>
            <div className="about-divider my-16 border-t border-secondary" />

            {/* Stats */}
            <div className="about-stats-grid grid grid-cols-3 gap-10">
              {stats.map((stat) => (
                <div key={stat.value} className="about-stat">
                  <CountUp
                    value={stat.value}
                    className="mb-2 text-8xl font-bold text-secondary font-archivo"
                  />
                  <p className="max-w-50 text-xl text-primary font-inter pt-8">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Bounded>
    </section>
  );
};

export default AboutUs;
