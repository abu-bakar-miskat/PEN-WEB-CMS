"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import QuoteIcon from "@/components/sharedIcons/QuoteIcon";
import FeedbackCard, { FeedbackItem } from "./FeedbackCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const feedbackData: FeedbackItem[] = [
  {
    id: "1",
    name: "Nugraha",
    role: "Fonder of Mangcoding",
    avatar: "/home/avatar.png",
    quote:
      "Mangcoding is a biggest company in Indonesia, who provides the services in Development Website, Shopify and Wordpress",
  },
  {
    id: "2",
    name: "Nugraha",
    role: "Fonder of Mangcoding",
    avatar: "/home/avatar.png",
    quote:
      "Mangcoding is a biggest company in Indonesia, who provides the services in Development Website, Shopify and Wordpress",
  },
  {
    id: "3",
    name: "Nugraha",
    role: "Fonder of Mangcoding",
    avatar: "/home/avatar.png",
    quote:
      "Mangcoding is a biggest company in Indonesia, who provides the services in Development Website, Shopify and Wordpress",
  },
  {
    id: "4",
    name: "Nugraha",
    role: "Fonder of Mangcoding",
    avatar: "/home/avatar.png",
    quote:
      "Mangcoding is a biggest company in Indonesia, who provides the services in Development Website, Shopify and Wordpress",
  },
];

const centerTestimonial: FeedbackItem = {
  id: "center",
  name: "Nugraha",
  role: "Fonder of Mangcoding",
  avatar: "/home/avatar.png",
  bgImage: "/home/feedback-center.jpg",
  quote:
    "Mangcoding is a biggest company in Indonesia, who provides the services in Development Website, Shopify and Wordpress",
};

const Feedback = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(".feedback-item", { y: 50, opacity: 0 });
      gsap.to(".feedback-item", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".feedback-grid",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Bounded>
      <section ref={sectionRef} className="py-24">
        <div className="mb-16">
          <HeadingSection
            tag="Feedback"
            title="What people say"
            details="Hear what our clients say about their experience working with us and how our solutions helped them achieve real results."
          />
        </div>

        {/* Grid: left cards | center image | right cards */}
        <div className="feedback-grid grid h-[470px] grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div className="feedback-item"><FeedbackCard item={feedbackData[0]} /></div>
            <div className="feedback-item"><FeedbackCard item={feedbackData[2]} /></div>
          </div>

          {/* Center image with overlay testimonial */}
          <div className="feedback-item relative overflow-hidden rounded-2xl">
            <Image
              src={centerTestimonial.bgImage!}
              alt={centerTestimonial.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="my-2 text-[16px] font-inter leading-relaxed text-white">
                {centerTestimonial.quote}
              </p>
              <div className="flex items-center justify-between  pt-6">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={centerTestimonial.avatar}
                      alt={centerTestimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {centerTestimonial.name}
                    </p>
                    <p className="text-xs text-white/70">
                      {centerTestimonial.role}
                    </p>
                  </div>
                </div>
                <QuoteIcon />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="feedback-item"><FeedbackCard item={feedbackData[1]} /></div>
            <div className="feedback-item"><FeedbackCard item={feedbackData[3]} /></div>
          </div>
        </div>
      </section>
    </Bounded>
  );
};

export default Feedback;
