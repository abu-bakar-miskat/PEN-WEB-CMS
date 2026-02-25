"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import Image from "next/image";
import ParallaxImage from "@/components/shared/Animation/ParallaxImage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutUsBanner = () => {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imgRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );

      // Parallax: image moves slightly while scrolling
      gsap.to(imgRef.current!.querySelector("img"), {
        yPercent: -16,
        ease: "none",
        scrollTrigger: {
          trigger: imgRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <Bounded className="pb-[70px] pt-40">
      {/* heading section */}
      <div className="pb-[60px]">
        <HeadingSection
          tag="About Us"
          title="Who We Are"
          subTitle="ZETA System of Smartlearning is an education guidance and admissions support organisation based in the UK. "
          details="Our role is to help students navigate their education journey with confidence. We focus on providing realistic options, clear advice, and steady support — allowing students to make informed decisions without pressure. "
          alignEnd
        />
      </div>
      <ParallaxImage
        src="/assets/aboutBanner.png"
        alt="About Us Banner"
        width={1280}
        height={550}
        speed={18}
      />
    </Bounded>
  );
};

export default AboutUsBanner;
