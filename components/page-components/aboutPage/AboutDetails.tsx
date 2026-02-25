"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import CountUp from "@/components/shared/Animation/CountUp";
import PageTitleSVG from "@/components/sharedIcons/PageTitleSVG";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  value: string;
  description: string;
}

const stats: StatItem[] = [
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

const AboutDetails = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading slide up
      gsap.fromTo(
        ".about-detail-heading",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-detail-heading",
            start: "top 85%",
            once: true,
          },
        },
      );

      // Description slide up
      gsap.fromTo(
        ".about-detail-description",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-detail-description",
            start: "top 85%",
            once: true,
          },
        },
      );

      // Divider scale from left
      gsap.fromTo(
        ".about-detail-divider",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 1.8,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".about-detail-divider",
            start: "top 90%",
            once: true,
          },
        },
      );

      // Stats staggered entrance
      gsap.fromTo(
        ".about-detail-stat",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-detail-stats",
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <Bounded>
        <div className="py-24 flex items-start gap-20">
          {/* Header */}
          <div className="shrink-0 flex items-center gap-2">
            <PageTitleSVG />
            <span className="text-[24px] font-bold text-primary font-archivo">
              About ZETA
            </span>
          </div>
          {/* Details */}
          <div className="max-w-5xl">
            {/* Heading */}
            <h2 className="about-detail-heading mb-12 indent-16 text-5xl font-semibold leading-snug text-primary md:text-4xl font-archivo">
              We envision a future where education empowers individuals to
              create positive changes in society.
            </h2>

            {/* Description */}
            <p className="about-detail-description mb-12 text-[16px] leading-relaxed text-primary font-inter">
              Situated strategically in the vibrant city of London, William
              College is dedicated to offering an inclusive and dynamic learning
              experience. We pride ourselves on fostering a nurturing and
              engaging educational environment that encourages personal and
              academic growth.
            </p>

            {/* Divider */}
            <div className="about-detail-divider mb-16 border-t border-secondary" />

            {/* Stats */}
            <div className="about-detail-stats grid grid-cols-1 gap-10 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.value} className="about-detail-stat">
                  <CountUp
                    value={stat.value}
                    className="mb-2 text-8xl font-bold text-secondary md:text-6xl font-archivo"
                  />
                  <p className="text-xl font-inter text-primary">
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

export default AboutDetails;
