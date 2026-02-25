export const CourseSkeleton = () => {
  return (
    <div className="max-w-[624px] w-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-624/443 w-full bg-gray-200 rounded-2xl" />

      {/* Text Section */}
      <div className="space-y-3 mt-[14px]">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Button Section */}
      <div className="mt-[14px] flex items-center justify-between">
        <div className="h-10 w-32 bg-gray-200 rounded-full" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
};

