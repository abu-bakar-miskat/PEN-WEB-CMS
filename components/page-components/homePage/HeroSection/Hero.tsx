"use client";

import Bounded from "@/components/shared/Bounded/Bounded";
import FlipLink from "@/components/shared/Animation/FlipLink";
import { useHero } from "@/lib/hooks/pages/home/useHero";
import FlipLinkReverse from "@/components/shared/Animation/FlipLinkReverse";

const Hero = () => {
  const { data: hero } = useHero();

  const fields = hero?.content?.fields ?? [];
  const heading = fields.find((f: { name: string }) => f.name === "Heading");
  const subHeading = fields.find(
    (f: { name: string }) => f.name === "Sub Heading",
  );
  const ctaLink = fields.find((f: { type: string }) => f.type === "link");

  return (
    <section className="relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60" />
      <Bounded className="relative z-10">
        <div className="flex min-h-screen flex-col items-center justify-center py-24 ">
          {/* Heading */}
          {heading?.value ? (
            <div
              className="text-center text-[72px] font-bold leading-tight text-white md:text-7xl font-archivo [&_strong]:text-secondary [&_*]:!text-center"
              dangerouslySetInnerHTML={{ __html: heading.value }}
            />
          ) : (
            <h1 className="text-center text-[72px] font-bold leading-tight text-white md:text-7xl font-archivo">
              Clear Guidance for{" "}
              <span className="text-secondary">Confident Education</span>{" "}
              Decisions.
            </h1>
          )}
          {/* Divider + Description row */}
          <div className="mt-10 flex  items-start gap-13">
            <div className="mt-3 h-px flex-1 shrink-0 min-w-80 bg-white" />
            <p className="text-[18px] max-w-xl leading-relaxed text-white font-inter ">
              {subHeading?.value ??
                "ZSOS supports students throughout the UK study process with personalised advice, practical insight, and consistent support at every stage."}
            </p>
          </div>
          {/* CTA Button */}
          <div className="mt-8 rounded-full bg-secondary px-6 py-3.5 flex items-center justify-center transition-colors hover:bg-secondary/90">
            <FlipLinkReverse
              href={ctaLink?.value ?? "/courses"}
              className="text-base font-medium text-primary font-archivo"
              hoverColor="#0E1A40"
            >
              {ctaLink?.name ?? "Start your journey"}
            </FlipLinkReverse>
          </div>
        </div>
      </Bounded>
    </section>
  );
};

export default Hero;
