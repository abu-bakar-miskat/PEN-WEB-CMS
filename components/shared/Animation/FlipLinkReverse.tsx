"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";

interface FlipLinkProps {
  href: string;
  children: string;
  className?: string;
  hoverColor?: string;
}

const FlipLinkReverse = ({
  href,
  children,
  className = "",
  hoverColor = "#D9A866",
}: FlipLinkProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState<number>(0);

  const measureRef = useCallback((node: HTMLSpanElement | null) => {
    if (node) {
      setLineHeight(node.offsetHeight);
    }
  }, []);

  const handleMouseEnter = () => {
    if (!wrapperRef.current) return;
    gsap.to(wrapperRef.current, {
      y: "50%",
      duration: 0.4,
      ease: "power2.inOut",
    });
  };

  const handleMouseLeave = () => {
    if (!wrapperRef.current) return;
    gsap.to(wrapperRef.current, {
      y: "0%",
      duration: 0.4,
      ease: "power2.inOut",
    });
  };

  return (
    <Link
      href={href}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="overflow-hidden h-[1.15em]"
        style={lineHeight ? { height: lineHeight } : undefined}
      >
        <div ref={wrapperRef} className="-translate-y-1/2">
          <span className="block" style={{ color: hoverColor }}>
            {children}
          </span>
          <span ref={measureRef} className="block">
            {children}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FlipLinkReverse;
