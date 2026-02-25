import React from "react";

const HeadingSectionSkeleton = ({ alignEnd = false }: { alignEnd?: boolean }) => {
    return (
        <div className="animate-pulse space-y-[20px]">
            {/* Title Tag Skeleton */}
            <div className="h-8 w-32 bg-gray-200 rounded-full" />

            <div
                className={`w-full flex ${alignEnd ? "items-end" : "items-center"} justify-between gap-[28px]`}
            >
                <div className="space-y-[20px] w-full">
                    {/* Main Title Skeleton */}
                    <div className="h-[70px] bg-gray-200 rounded-xl w-3/4" />

                    {/* Subtitle Skeleton */}
                    <div className="h-[40px] bg-gray-200 rounded-lg w-1/2" />
                </div>

                {/* Details Skeleton */}
                <div className="w-full max-w-[480px] hidden md:block">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeadingSectionSkeleton;
