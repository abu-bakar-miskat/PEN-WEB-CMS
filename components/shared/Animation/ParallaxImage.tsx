"use client";

import { useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps extends ImageProps {
  speed?: number; // control parallax intensity
  containerClassName?: string;
}

const ParallaxImage = ({
  speed = 15,
  containerClassName = "",
  className = "",
  ...props
}: ParallaxImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Fade + reveal
      gsap.fromTo(
        containerRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );

      // Parallax movement
      gsap.to(imageRef.current, {
        yPercent: -speed,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-2xl ${containerClassName}`}
    >
      <div ref={imageRef}>
        <Image
          {...props}
          className={`w-full h-auto object-cover scale-125 ${className}`}
        />
      </div>
    </div>
  );
};

export default ParallaxImage;
