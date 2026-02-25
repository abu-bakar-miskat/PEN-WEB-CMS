"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountUpProps {
  value: string;
  className?: string;
  duration?: number;
}

const CountUp = ({ value, className = "", duration = 2 }: CountUpProps) => {
  const elRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!elRef.current) return;

    const prefix = value.match(/^[^\d]*/)?.[0] ?? "";
    const suffix = value.match(/[^\d]*$/)?.[0] ?? "";
    const numeric = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    const hasDecimal = value.includes(".");
    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: numeric,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: elRef.current,
        start: "top 90%",
      },
      onUpdate: () => {
        if (elRef.current) {
          elRef.current.textContent =
            prefix +
            (hasDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) +
            suffix;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <p ref={elRef} className={className}>
      {value}
    </p>
  );
};

export default CountUp;
