"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Linkedin } from "lucide-react";
import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const teamData = [
  {
    id: "1",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-1.png",
    linkedin: "#",
  },
  {
    id: "2",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-2.png",
    linkedin: "#",
  },
  {
    id: "3",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-3.png",
    linkedin: "#",
  },
  {
    id: "4",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-4.png",
    linkedin: "#",
  },
  {
    id: "5",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-5.png",
    linkedin: "#",
  },
  {
    id: "6",
    name: "Michel John Smith",
    role: "Student Manager",
    image: "/team/team-6.png",
    linkedin: "#",
  },
];

const TeamMembers = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".team-grid",
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Bounded>
      <section ref={sectionRef} className="py-24">
        <div className="flex items-start gap-10">
          <div className="shrink-0 pt-2">
            <TitleTag tag="Our Team Member" />
          </div>

          <div className="team-grid grid w-full grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {teamData.map((member) => (
              <div key={member.id} className="team-card group">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f0ece6]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-all duration-300 group-hover:blur-[2px] group-hover:scale-105"
                  />
                  {/* <div className="absolute inset-0  opacity-0 transition-opacity duration-500 group-hover:opacity-100" /> */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <Link
                      href={member.linkedin}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 hover:scale-110"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-archivo text-[16px] font-bold leading-6 text-primary">
                    {member.name}
                  </p>
                  <p className="font-inter text-[14px] leading-5 text-primary-400">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Bounded>
  );
};

export default TeamMembers;
