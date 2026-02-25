"use client";

import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";
import React, { useEffect, useRef } from "react";
import ServiceList from "./ServiceList";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCoreServices } from "@/lib/hooks/pages/services/useServiceSections";
import CoreServicesSkeleton from "./CoreServicesSkeleton";

interface ServiceListItem {
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface CoreServicesData {
  content: {
    tag: string;
    details: string;
    service_list: ServiceListItem[];
  };
}

export const servicesData = [
  {
    id: "01",
    title: "Course & Pathway Guidance",
    description:
      "We help students explore suitable courses and entry routes based on their academic background, experience, and future plans.",
  },
  {
    id: "02",
    title: "University Selection Support",
    description:
      "We assist in shortlisting universities that match academic goals, budget, and career ambitions.",
  },
  {
    id: "03",
    title: "Application Assistance",
    description:
      "Our team supports students throughout the application process, ensuring accurate documentation and timely submission.",
  },
  {
    id: "04",
    title: "Visa Processing Guidance",
    description:
      "We provide step-by-step guidance for visa applications, interview preparation, and required financial documentation.",
  },
  {
    id: "05",
    title: "Funding & Finance Guidance",
    description:
      "We guide students in finding scholarship opportunities and understanding financial planning options.",
  },
  {
    id: "06",
    title: "Pre-Departure Support",
    description:
      "We offer orientation sessions and practical advice to help students transition smoothly to their new academic journey.",
  },
];

const CoreServices = () => {
  const { data, isLoading } = useCoreServices();
  const coreSevicesData = data as CoreServicesData;
  const fields = coreSevicesData?.content;
  console.log(fields);
  // console.log(Object.keys(sectionHeading?.content).join(","))
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Set initial states to avoid flash of content then disappearance
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      if (listRef.current) {
        gsap.set(listRef.current.children, { opacity: 0, y: 40 });
      }

      // Heading animation
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      // Service list items stagger animation
      const items = listRef.current?.children;
      if (items && items.length > 0) {
        gsap.to(Array.from(items), {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 100%",
            toggleActions: "play none none none",
          },
        });
      }
    }, containerRef);

    // Refresh twice to be safe - once immediately and once after a short delay
    ScrollTrigger.refresh();
    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
    };
  }, []);

  if (isLoading || !fields) {
    return <CoreServicesSkeleton />;
  }

  return (
    <div ref={containerRef} className="bg-primary-700 overflow-hidden">
      <Bounded className="py-[100px] ">
        {/* title part  */}
        <div
          ref={headingRef}
          className="flex items-start justify-between pb-[70px]"
        >
          {/* title tag  */}
          <TitleTag tag={fields?.tag} className={"text-secondary"} />
          <div>
            <p className="text-white font-archivo text-[30px] leading-[40px] font-semibold max-w-[860px] mr-10">
              {fields?.details}
            </p>
          </div>
        </div>

        {/* service list  */}
        <div ref={listRef} className="">
          {fields?.service_list.map((service: ServiceListItem, idx: number) => (
            <ServiceList
              key={service?.number}
              {...service}
              isLast={idx === fields.service_list.length - 1}
            />
          ))}
        </div>
      </Bounded>
    </div>
  );
};

export default CoreServices;
