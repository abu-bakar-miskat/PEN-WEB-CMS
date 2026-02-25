"use client";

import React, { useRef } from "react";
import { Plus, Minus } from "lucide-react";
import gsap from "gsap";

export interface FAQItem {
  question: string;
  answer: string;
}

const FAQCard = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      gsap.fromTo(
        contentRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  return (
    <div className="rounded-2xl bg-white p-8  border border-[#F8EAD9] shadow-xs">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white font-archivo">
          {index + 1}
        </span>
        <span className="flex-1 text-xl font-bold text-primary font-archivo">
          {item.question}
        </span>
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-100">
          <Plus
            className={`absolute h-4 w-4 text-primary-400 transition-all duration-300 ${
              isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <Minus
            className={`absolute h-4 w-4 text-primary-400 transition-all duration-300 ${
              isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          />
        </span>
      </button>
      <div ref={contentRef} className="h-0 overflow-hidden opacity-0">
        <p className="mt-4 pl-13 text-base leading-relaxed text-primary-300 font-inter">
          {item.answer}
        </p>
      </div>
    </div>
  );
};

export default FAQCard;
