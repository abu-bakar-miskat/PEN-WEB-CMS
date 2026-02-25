import React from "react";
import Image from "next/image";

export interface WhyUsItem {
  id: string;
  number: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
}

const WhyUsCard = ({ item }: { item: WhyUsItem }) => {
  return (
    <div className="border-t border-white/10 py-12 bg-primary ">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[.5fr_1fr_auto] lg:gap-x-24 lg:gap-y-20">
        {/* Number */}
        <div className="flex items-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold bg-secondary">
            {item.number}
          </span>
        </div>

        {/* Content */}
        <div className="">
          <h3 className="mb-4 text-[32px] font-bold text-white leading-snug">
            {item.title}
          </h3>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-primary-100">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-4 max-w-md ">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-primary-400 px-4 py-2 text-xs font-medium text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[290px] w-[290px] overflow-hidden rounded-2xl">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="290px"
          />
        </div>
      </div>
    </div>
  );
};

export default WhyUsCard;
