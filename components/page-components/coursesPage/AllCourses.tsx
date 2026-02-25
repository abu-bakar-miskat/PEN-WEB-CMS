import { createClient } from "@/lib/supabase/server";
import CourseCard from "./CourseCard";
import { CourseSkeleton } from "@/components/shared/CourseCardSkeleton/CourseCardSekeleton";

type Course = {
  id: number;
  coursetitle: string;
  qualificationtype: string;
  withfoundation: boolean;
  courseoverview: string;
  ispopular: boolean;
};

const AllCourses = async () => {
  let allCourses: Course[] = [];
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

    allCourses = [...(aupData.data || []), ...(williamData.data || [])];
    // console.log("--.>>", allCourses)
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }

  return (
    <div className="grid grid-cols-2 gap-[32px]">
      {allCourses.length > 0
        ? allCourses.map((course: Course, index: number) => (
          <div key={course.id}>
            <CourseCard course={course} index={index} />
          </div>
        ))
        : Array.from({ length: 6 }).map((_, index) => (
          <CourseSkeleton key={index} />
        ))}
    </div>
  );
};

export default AllCourses;
