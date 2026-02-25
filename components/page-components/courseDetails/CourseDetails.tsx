"use client";
import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CourseOverview from "./CourseOverview";
import {
  Asterisk,
  BookCheckIcon,
  CircleArrowOutDownRight,
  GraduationCap,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the campus type
interface CampusInfo {
  campusName?: string;
  campus_name?: string;
  cityName?: string;
  city_name?: string;
}

// Define the course type based on your database structure
export interface CourseType {
  id: number;
  courseTitle: string;
  courseOverview: string;
  qualification?: {
    qualificationType: string;
  };
  withFoundation: boolean;
  startDate: string;
  courseDuration: string;
  studyMode: string;
  campuses: CampusInfo | CampusInfo[] | string | null;
  tuitionFee: string;
  awardingBody?: string;
  whyStudy: string;
  modules: string;
  careerProspects: string;
  entryRequirements: string;
  englishRequirements: string;
  courseProspectus: string;
  teachingAndAssessment: string;
  additionalInfo?: string;
  feesRegulationInfo: string;
  sandwichYear?: string;
}

// Define module types
interface ModuleInfo {
  name?: string;
  title?: string;
  description?: string;
  credits?: number;
  code?: string;
}

interface ModuleYear {
  year: number;
  yearDescription?: string;
  modules: ModuleInfo[];
  notes?: string;
}

interface ModuleYearItem {
  year?: number;
  yearDescription?: string;
  modules?: ModuleInfo[];
  notes?: string;
  title?: string;
  name?: string;
  description?: string;
}

type ModuleItem = ModuleYearItem | string;

// Helper function to format campus information
function formatCampusInfo(campuses: CourseType["campuses"]): string {
  if (!campuses) return "N/A";

  if (typeof campuses === "string") {
    return campuses;
  }

  if (Array.isArray(campuses)) {
    return campuses
      .map((campus) =>
        typeof campus === "object"
          ? `${campus.campusName || campus.campus_name || ""} ${
              campus.cityName || campus.city_name || ""
            }`.trim()
          : campus,
      )
      .join(", ");
  }

  if (typeof campuses === "object") {
    return (
      `${campuses.campusName || campuses.campus_name || ""} ${
        campuses.cityName || campuses.city_name || ""
      }`.trim() || "N/A"
    );
  }

  return String(campuses);
}

// Get course image based on course title
function getCourseImage(courseTitle: string): string {
  const title = courseTitle.toLowerCase();

  if (title.includes("fashion")) {
    // return "/courses/fashion.jpg";
    return "/assets/serviceBanner.jpg";
  }
  if (title.includes("design") || title.includes("graphic")) {
    return "/assets/serviceBanner.jpg";
  }
  if (title.includes("business") || title.includes("management")) {
    return "/assets/aboutBanner.png";
  }
  if (title.includes("law")) {
    return "/assets/serviceBanner.jpg";
  }

  return "/courses/default.jpg";
}

// Image component with skeleton loading
function CourseHeroImage({ src, alt }: { src: string; alt: string }) {
  const [isLoading] = useState(true);

  return (
    <div className="absolute inset-0">
      {isLoading && "Loading..."}
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

// Helper function to render modules properly
const renderModules = (modules: ModuleItem[]) => {
  if (!modules || modules.length === 0) return null;

  return (
    <div className="space-y-8">
      {modules.map((item: ModuleItem, index: number) => {
        // If it's a year-based structure
        if (
          typeof item === "object" &&
          item !== null &&
          item.year !== undefined &&
          item.modules
        ) {
          const yearLabel =
            item.year === 0 ? "Foundation Year" : `Year ${item.year}`;

          return (
            <div
              key={index}
              className="bg-primary-600 border border-primary-300 rounded-[16px] p-[24px] animate-structure"
            >
              <h4 className="font-bold text-xl text-primary-50 mb-4">
                {yearLabel}
              </h4>
              {item.yearDescription && (
                <div
                  className="text-secondary-600 mb-4 "
                  dangerouslySetInnerHTML={{ __html: item.yearDescription }}
                />
              )}

              {Array.isArray(item.modules) && item.modules.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.modules.map(
                    (module: ModuleInfo, moduleIndex: number) => (
                      <div
                        key={moduleIndex}
                        className="p-4 border border-primary-400 rounded-lg bg-primary-700 hover:bg-primary transition-colors"
                      >
                        <h5 className="font-archivo text-[24px] leading-[34px] mb-[20px] text-secondary-50">
                          {module.name ||
                            module.title ||
                            `Module ${moduleIndex + 1}`}
                        </h5>
                        <div className="flex items-center gap-3">
                          {module.credits && (
                            <span className="text-base border border-secondary bg-secondary-600/50  text-primary-50 px-2 py-1 rounded-md ">
                              {module.credits} credits
                            </span>
                          )}
                          {module.code && (
                            <p className="text-base border border-secondary bg-secondary-600/50 text-primary-50 px-3 py-1 rounded-md w-fit">
                              {module.code}
                            </p>
                          )}
                        </div>
                        {module.description && (
                          <p className="text-gray-600 text-sm mt-2">
                            {module.description}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Subject to change. */}
              {item.notes && (
                <div className="mt-4 p-4 bg-secondary-50 border-l-8 border-secondary-300 rounded">
                  <div
                    className="text-sm text-primary-600"
                    dangerouslySetInnerHTML={{ __html: item.notes }}
                  />
                </div>
              )}
            </div>
          );
        }

        // Simple module structure
        if (typeof item === "string") {
          return (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gray-50 animate-structure"
            >
              <h5 className="font-semibold text-deep-purple">{item}</h5>
            </div>
          );
        }

        // Object module structure with title/name
        if (
          typeof item === "object" &&
          item !== null &&
          (item.title || item.name)
        ) {
          return (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gray-50 animate-structure"
            >
              <h5 className="font-semibold text-deep-purple mb-2">
                {item.title || item.name}
              </h5>
              {item.description && (
                <p className="text-primary-700 text-sm">{item.description}</p>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

interface CourseDetailsProps {
  course: CourseType | null;
  error: Error | null;
}

export default function CourseDetails({ course, error }: CourseDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverviewExpanded] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const requirementsRef = useRef<HTMLDivElement>(null);
  const requirementsCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!course) return;

    const ctx = gsap.context(() => {
      // Hero Animation
      if (heroRef.current) {
        const heroElements = heroRef.current.querySelectorAll(".animate-hero");
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top 80%",
            },
          },
        );
      }

      // Hero Image Animation
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 80%",
            },
          },
        );
      }

      // Structure Section Animation
      if (structureRef.current) {
        gsap.fromTo(
          structureRef.current.querySelectorAll(".animate-structure"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: structureRef.current,
              start: "top 80%",
            },
          },
        );
      }

      // Requirements Section Animation
      if (requirementsRef.current) {
        gsap.fromTo(
          requirementsRef.current.querySelectorAll(".animate-req-header"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: requirementsRef.current,
              start: "top 80%",
            },
          },
        );
      }

      // Requirements Cards Animation
      if (requirementsCardsRef.current) {
        gsap.fromTo(
          requirementsCardsRef.current.querySelectorAll(".animate-req-card"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: requirementsCardsRef.current,
              start: "top 85%",
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [course]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep-purple mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600">Please try again in a few minutes</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-deep-purple mb-4">
            Course not found
          </h2>
          <p className="text-gray-600">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const courseImage = getCourseImage(course.courseTitle || "");
  const campusInfo = formatCampusInfo(course.campuses);

  // Parse JSON fields safely
  let whyStudyPoints: string[] = [];
  let modulesList: ModuleItem[] = [];

  try {
    const whyStudyData = course.whyStudy || "[]";
    whyStudyPoints = JSON.parse(whyStudyData) as string[];
  } catch {
    whyStudyPoints = [];
  }

  try {
    const modulesData = course.modules || "[]";
    modulesList = JSON.parse(modulesData) as ModuleItem[];
  } catch {
    modulesList = [];
  }

  // Strip HTML tags
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };

  // Get plain text overview
  const plainOverview = stripHtml(course.courseOverview || "");

  // Count words
  const words = plainOverview.split(/\s+/).filter(Boolean);
  const isLongOverview = words.length > 50;

  // Get limited text
  const limitedText = words.slice(0, 32).join(" ");

  return (
    <div className="course-details">
      <Bounded className="pt-40">
        <div
          ref={heroRef}
          className=" pb-[70px] space-y-[32px] flex flex-col justify-center w-full  text-center"
        >
          <div className="mx-auto flex justify-center animate-hero">
            {/* title tag  */}
            <TitleTag tag={"Course Details"} />
          </div>
          <div className="space-y-[32px]">
            <h2 className="max-w-5xl mx-auto text-center text-primary font-archivo text-[60px] leading-[70px] font-bold animate-hero">
              {course.qualification?.qualificationType || "BA (Hons)"}{" "}
              {course.courseTitle}
              {course.withFoundation && " with Foundation Year"}
            </h2>
            <div className="max-w-3xl mx-auto font-inter text-[24px] leading-[34px] font-normal text-primary animate-hero">
              <p>
                {isExpanded || !isLongOverview ? (
                  plainOverview
                ) : (
                  <>
                    {limitedText}{" "}
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-secondary font-semibold hover:underline inline"
                    >
                      Show more...
                    </button>
                  </>
                )}
              </p>

              {isExpanded && isLongOverview && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-secondary! font-semibold hover:underline ml-2"
                >
                  Show less...
                </button>
              )}
            </div>

            {/* buttons  */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-5 animate-hero">
              <button
                type="submit"
                className="group flex items-center space-x-3 bg-secondary hover:bg-secondary/90 text-primary py-[14px] px-[24px] rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <span className="font-semibold text-lg">Apply Now</span>
                <div className=" group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 7L17 17M17 17L17 7M17 17L7 17"
                      stroke="#0E1A40"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <Link href={`/courses/${course?.id}`}>
                <button className="text-[16px] leading-[22px] font-archivo text-primary font-semibold py-[16px] px-[24px] rounded-[32px] border border-[#F6B56A] bg-[#F6B56A]/10">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Bounded>

      {/* course image  */}
      <Bounded className="py-[70px]">
        <div
          ref={imageRef}
          className="relative aspect-1280/619 max-w-[1280px] w-full "
        >
          <Image
            src={courseImage}
            height={619}
            width={1280}
            className="object-cover rounded-2xl"
            alt="course image"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(91,141,184,0.20)_0%,rgba(91,141,184,0.20)_100%)] rounded-2xl" />
        </div>
      </Bounded>

      {/* course overview  */}
      <CourseOverview course={course} campusInfo={campusInfo} />

      {/* Course Structure */}
      <div className="bg-primary ">
        <Bounded className="pt-[70px] pb-[140px] ">
          <div ref={structureRef}>
            {/* title tag  */}
            <div className="animate-structure w-fit">
              <TitleTag tag={"Structure"} dark />
            </div>
          </div>
          {/* Course Modules */}
          {modulesList.length > 0 && (
            <section className="py-5 ">
              <div className="animate-structure">
                <h3 className="mb-[70px] text-primary-50 font-archivo text-[60px] leading-[70px] font-bold">
                  Course Structure
                </h3>
                <div className="">{renderModules(modulesList)}</div>
              </div>
            </section>
          )}
        </Bounded>
      </div>

      {/* Entry Requirements */}
      <Bounded className="pt-8 pb-0 xl:py-16 mt-7">
        <div className=" px-4 md:px-6">
          <div ref={requirementsRef}>
            <div className="max-w-6xl mx-auto text-center space-y-3 lg:space-y-5 mb-10 lg:mb-16">
              <div className="mx-auto flex justify-center animate-req-header">
                {/* title tag  */}
                <TitleTag tag={"Requirements"} />
              </div>
              <h3 className="text-primary font-archivo text-[60px] leading-[70px] font-bold animate-req-header">
                Entry Requirements
              </h3>
              <p className="text-base lg:text-lg font-inter text-primary animate-req-header">
                Learn about our mission to make higher education accessible and
                empowering for every
              </p>
            </div>
          </div>
          <div
            ref={requirementsCardsRef}
            className="max-w-6xl mx-auto h-full space-y-7"
          >
            <div className="space-y-7 h-full w-full">
              {/* Academic Requirements */}
              <div className="h-full bg-primary border border-primary-50 rounded-lg p-8 animate-req-card">
                <div className="flex items-center gap-2 lg:gap-4 mb-6">
                  <div>
                    <GraduationCap className="h-11 lg:h-12 w-11 lg:w-12 text-secondary-900 mr-2 p-2 rounded-lg bg-secondary" />
                  </div>
                  <h3 className="text-xl whitespace-break-spaces lg:text-3xl font-bold text-primary-50">
                    Academic Requirements
                  </h3>
                </div>

                <div
                  className="text-primary-50 px-7 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      course.entryRequirements ||
                      "<p>Please contact our admissions team for specific academic requirements for this program.</p>",
                  }}
                />
              </div>

              {/* English Language Requirements */}
              <div className="h-full bg-primary border border-primary-50 rounded-lg p-8 animate-req-card">
                <div className="">
                  <div className="flex items-center gap-2 lg:gap-4 mb-6">
                    <div>
                      <BookCheckIcon className="h-11 lg:h-12 w-11 lg:w-12 text-secondary-900 mr-2 p-2 rounded-lg bg-secondary" />
                    </div>
                    <h3 className="text-xl whitespace-break-spaces lg:text-3xl font-bold text-primary-50">
                      English Language Requirements
                    </h3>
                  </div>
                  <div
                    className="text-primary-50 px-7 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        course.englishRequirements ||
                        "<p>Please contact our admissions team for specific English language requirements for this program.</p>",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Requirements */}
            <div className="animate-req-card">
              <div className="h-full  rounded-lg p-8 bg-secondary-50 border border-secondary-600  ">
                <div className="flex items-center gap-2 lg:gap-4 mb-6">
                  <div>
                    <Asterisk className="h-11 lg:h-12 w-11 lg:w-12 text-secondary-900 mr-2 p-2 rounded-lg bg-secondary" />
                  </div>
                  <h3 className="text-xl whitespace-break-spaces lg:text-3xl font-bold text-deep-purple">
                    Portfolio Requirements (Optional)
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  <strong>(Optional)</strong> Applicants can submit a personal
                  &apos;portfolio&apos;, using any one of the following formats:
                </p>

                <ul className="space-y-4 text-gray-700 leading-relaxed mb-6 ml-9">
                  <li className="flex items-start ">
                    <div className="bg-gray-700 rounded-full p-1 mt-2 mr-3  shrink-0"></div>
                    <span>
                      <strong>A video or audio recording;</strong> using speech,
                      animation, images, or any other appropriate content the
                      candidate wishes. The video must be no less than one
                      minute and no more than two minutes in length.
                    </span>
                  </li>

                  <li className="flex items-start">
                    <div className="bg-gray-700 rounded-full p-1 mt-2 mr-3  shrink-0"></div>
                    <span>
                      <strong>A digital portfolio</strong> of images and writing
                      using Word, Canva, PowerPoint or any other suitable
                      software of the applicant&apos;s choice.
                    </span>
                  </li>
                </ul>

                <div className="rounded-lg my-6">
                  <div className="flex items-start text-gray-700 ">
                    <CircleArrowOutDownRight className=" w-6 h-6 mt-1 mr-3 shrink-0" />
                    <div>
                      <h3 className="text-lg inline-block font-semibold text-primary-700">
                        Portfolio Content:
                      </h3>
                      <p className="flex items-start gap-2 mt-2">
                        <span className="bg-gray-700 rounded-full p-1 mt-2 shrink-0"></span>
                        <span>
                          In the portfolio, applicants should clearly evidence
                          and explain the reasons they wish to study their
                          chosen subject and how they believe their studies can
                          positively impact their lives in the future.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary-600/40 p-4 rounded-lg ">
                  <p className="text-primary leading-relaxed">
                    <strong>Note:</strong>
                    {"  "} Applicants for the BA (Hons) Fashion Media and
                    Marketing course are not required to provide a personal
                    &apos;portfolio&apos;, unless they wish to do so.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Bounded>
    </div>
  );
}
