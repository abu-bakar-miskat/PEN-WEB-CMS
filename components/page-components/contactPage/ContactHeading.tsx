"use client";
import Bounded from "@/components/shared/Bounded/Bounded";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import HeadingSectionSkeleton from "@/components/shared/HeadingSection/HeadingSectionSkeleton";
import { useAllContactHeadingSection } from "@/lib/hooks/pages/contact/useContactSection";

const ContactHeading = () => {
  const { data: sectionHeading, isLoading } = useAllContactHeadingSection();
  const fields = sectionHeading?.content;

  if (isLoading || !fields) {
    return (
      <div className="animate-pulse">
        <Bounded className="pb-[70px] pt-40">
          <HeadingSectionSkeleton alignEnd />
          <div className="mt-[70px] flex items-center justify-between gap-[24px] h-full w-full">
            <div className="aspect-628/500 max-w-[628px] w-full bg-gray-200 rounded-2xl" />
            <div className="aspect-628/500 max-w-[628px] w-full bg-gray-200 rounded-2xl" />
          </div>
        </Bounded>
      </div>
    );
  }

  const { tag, title, details } = fields;
//   console.log(Object.keys(sectionHeading?.content).join(","));

  return <HeadingSection tag={tag} title={title}  details={details}/>;
};

export default ContactHeading;
