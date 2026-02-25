"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import ContactForm from "./ContactForm";
import Image from "next/image";
import { useContactData } from "@/lib/hooks/pages/contact/useContactSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ContactDetail {
  label: string;
  info: string;
}

interface ContactFields {
  contact_img: string;
  contact_info: ContactDetail[];
}

const ContactSection = () => {
  const { data: contactData, isLoading } = useContactData();
  const fields = contactData?.content as ContactFields;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !fields || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate Image
      gsap.from(".contact-image-container", {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-image-container",
          start: "top 85%",
        },
      });

      // Animate Contact Details
      gsap.from(".contact-info-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-info-container",
          start: "top 95%",
        },
      });
    }, containerRef);

    // Refresh ScrollTrigger as content might have changed layout
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isLoading, fields]);

  if (isLoading || !fields) {
    return (
      <Bounded className="pb-[70px] pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-pulse">
          <div className="space-y-8">
            {/* Image Skeleton */}
            <div className="relative rounded-2xl overflow-hidden h-[350px] bg-slate-200"></div>

            {/* Contact Details Skeleton */}
            <div className="space-y-8 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                    <div className="h-5 bg-slate-200 rounded w-full max-w-[200px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
            ))}
            <div className="h-14 bg-slate-200 rounded-full w-40 mt-4"></div>
          </div>
        </div>
      </Bounded>
    );
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "email":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case "address":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="currentColor" />
          </svg>
        );
      case "phone":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Bounded className="pb-[70px]">
      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          {/* Team Image or Banner */}
          <div className="contact-image-container relative rounded-2xl overflow-hidden h-[350px]">
            <Image
              src={fields?.contact_img}
              alt="contact image"
              className="w-full h-full object-cover"
              height={410}
              width={615}
            />
          </div>

          {/* Contact Details */}
          <div className="contact-info-container space-y-8 pt-4">
            {fields?.contact_info.map((detail: ContactDetail, idx: number) => (
              <div key={idx} className="contact-info-item flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-secondary-400! flex items-center justify-center text-secondary-900 shrink-0">
                  {renderIcon(detail.label.toLowerCase())}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-0.5 capitalize">
                    {detail.label}
                  </p>
                  <p className="text-xl font-bold text-[#2d3a5a] tracking-wide">
                    {detail.info}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div>
          <ContactForm />
        </div>
      </div>
    </Bounded>
  );
};



export default ContactSection;
