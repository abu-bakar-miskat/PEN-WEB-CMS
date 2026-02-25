import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface CourseItem {
  id: number;
  coursetitle: string;
  qualificationtype: string;
  withfoundation: boolean;
  courseoverview: string;
  ispopular: boolean;
}

const CourseCard = ({ course }: { course: CourseItem; index: number }) => {
  const title = `${course.qualificationtype || "BA (Hons)"} ${course.coursetitle}${course.withfoundation ? " with Foundation Year" : ""}`;
  const overview = course.courseoverview ?? "";
  const stripped = overview
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const truncated =
    stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;

  return (
    <Link
      href={`/courses/${course?.id}`}
      className="group block relative w-full rounded-2xl border border-transparent  transition-all duration-500 ease-out overflow-hidden"
    >
      <div className="relative aspect-624/443 w-full overflow-hidden rounded-xl bg-primary-50">
        <Image
          src="/courses/course-1.png"
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      <div className="space-y-3 mt-5">
        <h3 className="font-archivo text-xl leading-tight font-semibold text-primary  transition-colors duration-300">
          {title}
        </h3>
        <p className="font-inter text-[16px] leading-relaxed text-primary-300 line-clamp-3">
          {truncated}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="inline-flex items-center text-base font-archivo text-primary font-semibold py-3 px-6 rounded-full border border-secondary bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
          Learn More
        </div>
        <div className="w-10 h-10 rounded-full  flex items-center justify-center transform group-hover:-rotate-45 group-hover:bg-secondary/10 transition-all duration-500">
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
            <path d="M7 7l10 10M17 7v10H7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
