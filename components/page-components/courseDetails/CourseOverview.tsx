import React, { useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  CircleDollarSign,
  School,
  Book,
  BookA,
} from "lucide-react";
import { CourseType } from "./CourseDetails";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CourseOverview = ({
  course,
  campusInfo,
}: {
  course: CourseType;
  campusInfo: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".animate-card"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <section className="pt-16 pb-0 lg:py-16 ">
        <div className="  px-4 md:px-6 font-lato">
          <div className="max-w-6xl mx-auto mb-12">
            {/* First row of 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-3 lg:mb-6">
              {[
                {
                  icon: (
                    <Calendar className="h-10 w-10 text-primary-400 mr-2 p-2 rounded-lg bg-secondary-300" />
                  ),
                  title: "Start Date",
                  value: course.startDate || "Contact for Details",
                },
                {
                  icon: (
                    <Clock className="h-10 w-10 text-primary-400 mr-2 p-2 rounded-lg bg-secondary-300" />
                  ),
                  title: "Duration",
                  value: course.courseDuration || "3-4 Years",
                },
                {
                  icon: (
                    <School className="h-10 w-10 text-primary-400 mr-2 p-2 rounded-lg bg-secondary-300" />
                  ),
                  title: "Campus",
                  value: campusInfo,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${i == 2 && "col-span-1 md:col-span-2 lg:col-span-1 "} animate-card bg-secondary-50 hover:shadow-lg border border-secondary-300 h-full rounded-[16px] p-[16px]`}
                >
                  <div className="flex flex-row items-center space-y-0 pb-2">
                    {item.icon}
                    <h2 className="text-lg text-[#565F68]">{item.title}</h2>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#35404B]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row of 2 cards */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6 w-full">
              <div className="animate-card w-full h-full bg-secondary-50 hover:shadow-lg border border-secondary-300  rounded-[16px] p-[16px]">
                <h2 className="flex flex-row items-center space-y-0 pb-2">
                  <CircleDollarSign className="h-10 w-10 text-primary-400 mr-2 p-2 rounded-lg bg-secondary-300" />

                  <p className="text-lg text-[#565F68]">Tuition Fee</p>
                </h2>
                <div>
                  <p className="text-lg font-semibold text-[#35404B]">
                    {course.tuitionFee || "Contact for Details"}
                  </p>
                </div>
              </div>

              <div className="animate-card w-full h-full bg-secondary-50 hover:shadow-lg border border-secondary-300  rounded-[16px] p-[16px]">
                <div className="flex flex-row items-center space-y-0 pb-2">
                  <BookA className="h-10 w-10 text-primary-400 mr-2 p-2 rounded-lg bg-secondary-300" />

                  <h2 className="text-lg text-[#565F68]">Study Mode</h2>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#35404B]">
                    {course.studyMode || "Full-time"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseOverview;
