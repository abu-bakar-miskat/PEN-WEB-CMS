"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import PageTitleSVG from "@/components/sharedIcons/PageTitleSVG";
import FAQCard, { FAQItem } from "./FAQCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const faqData: FAQItem[] = [
  {
    question: "How do I apply for a course?",
    answer:
      "You can start by exploring our courses page and then registering your interest. Our advisors will then guide you through the specific application process for the university and course you've chosen.",
  },
  {
    question: "What support services do you offer?",
    answer:
      "We offer a wide range of support services including academic advising, career counseling, visa guidance, and accommodation assistance to ensure a smooth experience.",
  },
  {
    question: "Are there any fees for your support services?",
    answer:
      "Our core advisory services are completely free for students. Some premium services may have associated fees, which will be clearly communicated upfront.",
  },
  {
    question: "How can I contact ZETA for help?",
    answer:
      "You can reach us via email at marketing@zsos.co.uk, by phone at +44 20 4506 0049, or visit our office at 118-120 Meridian Place, London.",
  },
  {
    question: "How does billing work?",
    answer:
      "Billing is handled on a per-service basis. You will receive a detailed invoice before any charges are applied, and we accept multiple payment methods.",
  },
];

const FAQ = () => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));
  const sectionRef = useRef<HTMLElement>(null);

  const handleToggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Left text: slide from right to left
      gsap.set(".faq-text", { x: 60, opacity: 0 });
      gsap.to(".faq-text", {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });

      // Right cards: slide up
      gsap.set(".faq-card", { y: 50, opacity: 0 });
      gsap.to(".faq-card", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".faq-cards",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Bounded>
      <section ref={sectionRef} className="py-24">
        <div className="grid grid-cols-[3fr_4fr] gap-16 items-start">
          {/* Left */}
          <div>
            <div className="faq-text flex items-center gap-2 mb-6">
              <PageTitleSVG />
              <span className="text-[24px] font-bold tracking-wider text-primary font-archivo">
                FAQ
              </span>
            </div>
            <h2 className="faq-text text-6xl font-bold leading-tight text-primary font-archivo">
              Frequently asked questions
            </h2>
            <p className="faq-text mt-6 text-lg leading-relaxed text-primary-300 max-w-xl font-inter">
              Hear what our clients say about their experience working with us
              and how our solutions helped them achieve real results.
            </p>
          </div>

          {/* Right */}
          <div className="faq-cards flex flex-col gap-6">
            {faqData.map((item, index) => (
              <div key={index} className="faq-card">
              <FAQCard
                item={item}
                index={index}
                isOpen={openIndices.has(index)}
                onToggle={() => handleToggle(index)}
              />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Bounded>
  );
};

export default FAQ;
