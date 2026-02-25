import React from "react";
import { Globe } from "lucide-react";

export interface SolutionItem {
  id: string;
  title: string;
  description: string;
}

const SolutionCard = ({ item }: { item: SolutionItem }) => {
  return (
    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex h-22 w-22 items-center justify-center rounded-xl border border-secondary/30">
        <Globe className="h-8 w-8 text-secondary " />
      </div>
      <h3 className="mb-3 text-3xl font-semibold text-secondary">
        {item.title}
      </h3>
      <p className="text-[16px] leading-relaxed text-primary-100">
        {item.description}
      </p>
    </div>
  );
};

export default SolutionCard;
