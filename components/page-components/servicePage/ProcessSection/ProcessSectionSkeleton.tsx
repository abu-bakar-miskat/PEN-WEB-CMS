import React from "react";
import Bounded from "@/components/shared/Bounded/Bounded";

const ProcessSectionSkeleton = () => {
    return (
        <div className="animate-pulse">
            <Bounded className="py-[100px]">
                {/* Title Part Skeleton */}
                <div className="flex items-end justify-between pb-[70px]">
                    <div className="space-y-[20px]">
                        <div className="h-8 w-32 bg-gray-200 rounded-full" />
                        <div className="h-[70px] bg-gray-200 rounded-xl w-[400px]" />
                    </div>
                    <div className="w-full max-w-[482px] space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                    {[1, 2, 3, 4].map((idx) => (
                        <div key={idx} className="bg-gray-50 rounded-[16px] border-2 border-gray-200 border-dotted p-[32px] h-[300px]">
                            <div className="w-18 h-18 rounded-[12px] bg-gray-200 mb-8" />
                            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0" />
                                    <div className="h-6 bg-gray-200 rounded w-full" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0" />
                                    <div className="h-6 bg-gray-200 rounded w-5/6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Bounded>
        </div>
    );
};

export default ProcessSectionSkeleton;
