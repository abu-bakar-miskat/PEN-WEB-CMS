"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Course = {
  id: number;
  coursetitle: string;
  qualificationtype: string;
  withfoundation: boolean;
  courseoverview: string;
  ispopular: boolean;
};

const CourseCard = ({
  course,
  index,
}: {
  course: Course;
  index: number;
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "-70% 90%",
          toggleActions: "play none none none",
          // markers: true,
        },
        delay: (index % 2) * 0.1, // Slight stagger for the two-column grid
      }
    );
  }, [index]);

  const titleText = `${course.qualificationtype || "BA (Hons)"} ${course.coursetitle
    }${course.withfoundation ? " with Foundation Year" : ""}`;

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const defaultOverview =
    "Discover this exciting course and take your first step towards a rewarding career.";

  const overviewPlain = course.courseoverview
    ? stripHtml(course.courseoverview)
    : defaultOverview;

  const overviewWordCount = overviewPlain ? overviewPlain.split(" ").length : 0;

  const hasHtmlTags = /<[^>]+>/.test(course.courseoverview || "");

  const overviewToRender = !course.courseoverview
    ? defaultOverview
    : hasHtmlTags && overviewWordCount > 18
      ? truncateText(overviewPlain, 18)
      : course.courseoverview;

  return (
    <Link
      href={`/courses/${course?.id}`}
      ref={cardRef}
      className="group block relative max-w-[624px] w-full p-4 rounded-2xl border border-transparent hover:border-secondary/20 hover:bg-secondary/5  transition-all duration-500 ease-out overflow-hidden"
      style={{ opacity: 0 }} // Start invisible for JS to kick in
    >
      <div className="relative aspect-624/443 w-full overflow-hidden rounded-xl">
        <Image
          src="/assets/serviceBanner.jpg"
          alt={course.coursetitle}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Badge if popular */}
        {/* {course.ispopular && (
          <div className="absolute top-4 left-4 bg-secondary text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Popular
          </div>
        )} */}
      </div>

      <div className="space-y-3 mt-5">
        <h2 className="font-archivo text-xl leading-tight font-semibold text-primary group-hover:text-secondary transition-colors duration-300">
          {titleText}
        </h2>

        <p
          className="font-inter text-base leading-relaxed font-light text-primary-300 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: overviewToRender }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="inline-flex items-center text-base font-archivo text-primary font-semibold py-3 px-6 rounded-full border border-secondary bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
          Learn More
        </div>

        <div className="w-10 h-10 rounded-full border border-secondary/30 flex items-center justify-center transform group-hover:rotate-45 group-hover:bg-secondary/10 transition-all duration-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary"
          >
            <path d="M7 17l10-10M17 17V7H7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
