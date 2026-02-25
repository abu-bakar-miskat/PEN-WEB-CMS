"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import WhyUsCard, { WhyUsItem } from "./WhyUsCard";
import HeadingSection from "@/components/shared/HeadingSection/HeadingSection";
import { useWhyUs } from "@/lib/hooks/pages/home/useWhyUs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
const defaultWhyUsData: WhyUsItem[] = [
  {
    id: "1",
    number: 1,
    title: "Personalised, one-to-one guidance",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
    tags: ["Guidance", "Guidance", "Guidance", "Guidance", "Guidance"],
    image: "/home/why-us-1.png",
  },
  {
    id: "2",
    number: 2,
    title: "Clear explanations of the UK education system",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
    tags: ["Guidance", "Guidance", "Guidance", "Guidance", "Guidance"],
    image: "/home/why-us-2.png",
  },
  {
    id: "3",
    number: 3,
    title: "Advisors with practical admissions experience",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
    tags: ["Guidance", "Guidance", "Guidance", "Guidance", "Guidance"],
    image: "/home/why-us-3.png",
  },
  {
    id: "4",
    number: 4,
    title: "Ongoing support from enquiry to enrolment",
    description:
      "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way.",
    tags: ["Guidance", "Guidance", "Guidance", "Guidance", "Guidance"],
    image: "/home/why-us-4.png",
  },
];
const WhyUs = () => {
  const { data: whyUs } = useWhyUs();
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const fields = whyUs?.content?.fields ?? [];
  const tag = fields.find((f: { name: string }) => f.name === "Tag");
  const title = fields.find((f: { name: string }) => f.name === "Title");
  const details = fields.find((f: { name: string }) => f.name === "Details");
  const cardsField = fields.find((f: { name: string }) => f.name === "Cards");

  const titleFieldId = cardsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Title",
  )?.id;
  const descFieldId = cardsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Description",
  )?.id;
  const imageFieldId = cardsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Image",
  )?.id;
  const tagsFieldId = cardsField?.repeatableFields?.find(
    (f: { name: string }) => f.name === "Tags",
  )?.id;

  const whyUsData: WhyUsItem[] =
    cardsField?.value?.map((entry: Record<string, string>, index: number) => ({
      id: entry.id ?? String(index),
      number: index + 1,
      title: titleFieldId ? (entry[titleFieldId] ?? "") : "",
      description: descFieldId ? (entry[descFieldId] ?? "") : "",
      tags: tagsFieldId
        ? (entry[tagsFieldId] ?? "").split(",").map((t: string) => t.trim())
        : [],
      image: imageFieldId ? (entry[imageFieldId] ?? ``) : ``,
    })) ?? defaultWhyUsData;

  useEffect(() => {
    if (!cardsContainerRef.current || whyUsData.length === 0) return;

    const cards =
      cardsContainerRef.current.querySelectorAll<HTMLElement>(".why-us-card");

    const lastCard = cards[cards.length - 1];

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const isLast = i === cards.length - 1;

        ScrollTrigger.create({
          trigger: card,
          start: `top 110px`,
          endTrigger: isLast ? undefined : lastCard,
          end: isLast ? "+=1" : `top 100px`,
          pin: true,
          pinSpacing: false,
          id: `why-us-pin-${i}`,
        });
      });
    }, cardsContainerRef);

    return () => ctx.revert();
  }, [whyUsData]);

  return (
    <section className="bg-primary">
      <Bounded>
        <div className="py-25">
          {/* Header */}
          <HeadingSection
            tag={tag?.value ?? "Why Us"}
            title={title?.value ?? "Why choose ZETA"}
            details={
              details?.value ??
              "ZETA System of Smartlearning exists to provide clarity. We work closely with students to understand their background and goals, then guide them through the process in a structured, straightforward way."
            }
            dark
          />

          {/* Cards */}
          <div ref={cardsContainerRef} className="pt-18 ">
            {whyUsData.map((item) => (
              <div key={item.id} className="why-us-card">
                <WhyUsCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </Bounded>
    </section>
  );
};

export default WhyUs;
