"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(".form-item", {
        y: 30,
        opacity: 0,
      });

      // Animation
      gsap.to(".form-item", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          // Refresh on mount to ensure positions are correct
          // onRefresh: (self) => {
          //   if (self.progress > 0) {
          //     // If already past trigger, ensure it plays
          //     self.animation?.progress(1);
          //   }
          // }
        },
      });
    }, containerRef);

    // Call refresh after a short delay to account for any layout shifts
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="form-item group relative bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all hover:border-slate-200">
          <label className="block text-sm font-bold text-[#2d3a5a] mb-2">Name</label>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-transparent focus:outline-none placeholder:text-slate-300 text-[#2d3a5a] text-base"
              required
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        {/* Email Field */}
        <div className="form-item group relative bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all hover:border-slate-200">
          <label className="block text-sm font-bold text-[#2d3a5a] mb-2">Email</label>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent focus:outline-none placeholder:text-slate-300 text-[#2d3a5a] text-base"
              required
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </div>
        </div>

        {/* Subject Field */}
        <div className="form-item group relative bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all hover:border-slate-200">
          <label className="block text-sm font-bold text-[#2d3a5a] mb-2">Subject</label>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <input
              type="text"
              placeholder="Enter your subject"
              className="w-full bg-transparent focus:outline-none placeholder:text-slate-300 text-[#2d3a5a] text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>
        </div>

        {/* Message Field */}
        <div className="form-item group relative bg-white border border-slate-100 rounded-xl p-5 shadow-sm transition-all hover:border-slate-200">
          <label className="block text-sm font-bold text-[#2d3a5a] mb-2">Message</label>
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <textarea
              placeholder="Leave a message"
              rows={3}
              className="w-full bg-transparent focus:outline-none placeholder:text-slate-300 text-[#2d3a5a] text-base resize-none"
              required
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mt-1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        </div>

        <div className="form-item pt-4">
          <button
            type="submit"
            className="group flex items-center space-x-3 bg-secondary hover:bg-[#f9c388] text-[#2d3a5a] px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm font-bold"
          >
            <span className="text-base">Send Message</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
