import React from "react";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import CourseCard from "./CourseCard";
import { createClient } from "@/lib/supabase/server";
import { CourseSkeleton } from "@/components/shared/CourseCardSkeleton/CourseCardSekeleton";
import FadeUp from "../../../shared/Animation/FadeUp";

const Courses = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allCourses: any[] = [];
  try {
    const supabase = await createClient();
    //  Fetch courses from both institutions
    const [aupData, williamData] = await Promise.all([
      supabase.rpc("get_all_courses_with_details_by_institution", {
        p_inst_id: 2, // AUP/VCAD ID
      }),
      supabase.rpc("get_all_courses_with_details_by_institution", {
        p_inst_id: 3, // William College ID
      }),
    ]);
    allCourses = [...(aupData.data || []), ...(williamData.data || [])].slice(
      0,
      4,
    );
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }
  return (
    <Bounded>
      <section className="py-24">
        <div className="mb-16">
          <HeadingSection
            tag="Courses"
            title="Learning with Us"
            details="ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way."
          />
        </div>

        {/* Course Cards */}
        <FadeUp className="grid grid-cols-2 gap-8 pb-4">
          {allCourses.length > 0
            ? allCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))
            : Array.from({ length: 4 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))}
        </FadeUp>

        {/* View All Button */}
        <FadeUp className="mt-20 flex justify-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 rounded-full bg-secondary border border-transparent hover:bg-transparent hover:border-primary/20 px-6 py-3.5 text-[18px] font-normal text-primary transition-colors font-archivo"
          >
            View All Courses
            <ArrowDownRight className="h-6 w-6 transition-transform duration-300 ease-out group-hover:rotate-[-45deg]" />
          </Link>
        </FadeUp>
      </section>
    </Bounded>
  );
};

export default Courses;
