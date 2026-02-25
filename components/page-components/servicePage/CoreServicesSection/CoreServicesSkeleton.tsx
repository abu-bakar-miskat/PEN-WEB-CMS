import React from "react";
import Bounded from "@/components/shared/Bounded/Bounded";

const CoreServicesSkeleton = () => {
    return (
        <div className="bg-primary-700 overflow-hidden animate-pulse">
            <Bounded className="py-[100px]">
                {/* Title Part Skeleton */}
                <div className="flex items-start justify-between pb-[70px]">
                    <div className="h-8 w-40 bg-gray-400/20 rounded-full" />
                    <div className="w-full max-w-[860px] mr-10 space-y-3">
                        <div className="h-8 bg-gray-400/20 rounded-lg w-full" />
                        <div className="h-8 bg-gray-400/20 rounded-lg w-3/4" />
                    </div>
                </div>

                {/* Service List Skeleton */}
                <div className="space-y-0">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-[80px_1.2fr_2fr_80px] gap-10 items-start border-t border-primary-300/30 py-[40px]"
                        >
                            <div className="h-8 w-8 bg-gray-400/20 rounded" />
                            <div className="h-8 bg-gray-400/20 rounded w-3/4" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-400/20 rounded w-full" />
                                <div className="h-4 bg-gray-400/20 rounded w-5/6" />
                            </div>
                            <div className="h-12 w-12 bg-gray-400/20 rounded-full" />
                        </div>
                    ))}
                </div>
            </Bounded>
        </div>
    );
};

export default CoreServicesSkeleton;
