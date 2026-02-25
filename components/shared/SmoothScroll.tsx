"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface LocomotiveScrollInstance {
  destroy: () => void;
  scrollTo: (target: number, options?: object) => void;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locomotiveScrollRef = useRef<LocomotiveScrollInstance | null>(null);

  useEffect(() => {
    (async () => {
      const LocomotiveScrollModule = await import("locomotive-scroll");
      const LocomotiveScroll = LocomotiveScrollModule.default;
      locomotiveScrollRef.current = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.05,
          duration: 1.5,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          infinite: false,
        },
      }) as unknown as LocomotiveScrollInstance;
    })();

    return () => {
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
        locomotiveScrollRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.scrollTo(0, { duration: 0, immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
