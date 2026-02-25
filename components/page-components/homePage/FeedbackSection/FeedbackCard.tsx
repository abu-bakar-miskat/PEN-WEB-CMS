import React from "react";
import Image from "next/image";
import QuoteIcon from "@/components/sharedIcons/QuoteIcon";

export interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  bgImage?: string;
}

const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
  return (
    <div className="flex-1 rounded-2xl border border-[#F8EAD9] bg-white px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={item.avatar}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{item.name}</p>
            <p className="text-xs text-primary-300">{item.role}</p>
          </div>
        </div>
        <QuoteIcon />
      </div>
      <p className="text-[16px] font-inter leading-relaxed text-primary-300">
        {item.quote}
      </p>
    </div>
  );
};

export default FeedbackCard;
