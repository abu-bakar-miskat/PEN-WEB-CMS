import React, { ReactNode } from "react";
interface BoundedProps {
  children: ReactNode;
  className?: string;
}

const Bounded = ({ children, className }: BoundedProps) => {
  return (
    <div
      className={`mx-auto w-full px-5 md:px-7 lg:px-5 xl:max-w-[1440px] xl:px-[80px] ${className}`}
    >
      {children}
    </div>
  );
};

export default Bounded;
