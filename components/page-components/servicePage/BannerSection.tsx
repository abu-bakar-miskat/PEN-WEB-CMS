"use client";

import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useHeadingSection } from "@/lib/hooks/pages/services/useServiceSections";
import HeadingSectionSkeleton from "@/components/shared/HeadingSection/HeadingSectionSkeleton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BannerSection = () => {
  const { data: sectionHeading, isLoading } = useHeadingSection();
  const fields = sectionHeading?.content;
  // console.log(Object.keys(sectionHeading?.content).join(","))

  const containerRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const images = [image1Ref.current, image2Ref.current];

      images.forEach((img, index) => {
        if (!img) return;

        const innerImage = img.querySelector("img");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: img,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });

        // Clip-path reveal animation
        tl.fromTo(
          img,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            y: 100,
            opacity: 0,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 1.5,
            delay: index * 0.2, // Staggered entry
            ease: "power4.out",
          },
        );

        // Slow scale down effect for the image inside
        if (innerImage) {
          tl.fromTo(
            innerImage,
            { scale: 1.4, rotate: index % 2 === 0 ? -2 : 2 },
            {
              scale: 1,
              rotate: 0,
              duration: 2,
              ease: "power2.out",
            },
            "<", // Start at the same time as the parent animation
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (isLoading || !fields) {
    return (
      <div className="animate-pulse">
        <Bounded className="pb-[70px] pt-40">
          <HeadingSectionSkeleton alignEnd />
          <div className="mt-[70px] flex items-center justify-between gap-[24px] h-full w-full">
            <div className="aspect-628/500 max-w-[628px] w-full bg-gray-200 rounded-2xl" />
            <div className="aspect-628/500 max-w-[628px] w-full bg-gray-200 rounded-2xl" />
          </div>
        </Bounded>
      </div>
    );
  }

  const { tag, title, details, sub_title, left_image, right_image } = fields;

  return (
    <div ref={containerRef}>
      <Bounded className="pb-[70px] pt-40">
        {/* heading section  */}
        <HeadingSection
          tag={tag}
          title={title}
          subTitle={sub_title}
          details={details}
          alignEnd
        />

        <div className="mt-[70px] flex items-center justify-between gap-[24px] h-full w-full">
          <div
            ref={image1Ref}
            className="relative aspect-628/500 max-w-[628px] w-full h-full shrink-0 overflow-hidden rounded-2xl"
          >
            <Image
              src={left_image}
              alt="Service Banner"
              fill
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_57.01%)]" />
          </div>

          <div
            ref={image2Ref}
            className="relative aspect-628/500 max-w-[628px] w-full h-full shrink-0 overflow-hidden rounded-2xl"
          >
            <Image
              src={right_image}
              alt="Service Banner "
              fill
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_57.01%)] " />
          </div>
        </div>
      </Bounded>
    </div>
  );
};

export default BannerSection;
