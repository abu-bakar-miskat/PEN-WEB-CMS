"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Bounded from "@/components/shared/Bounded/Bounded";
import TitleTag from "@/components/shared/TitleTag";
import BlogCard, {
  BlogPost,
} from "@/components/page-components/blogsPage/BlogCard";
import FlipLink from "@/components/shared/Animation/FlipLink";
import { ArrowDownRight } from "lucide-react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BlogsClient = ({ posts }: { posts: BlogPost[] }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current || posts.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(".blog-text", { x: 60, opacity: 0 });
      gsap.to(".blog-text", {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });

      gsap.set(".blog-card", { y: 50, opacity: 0 });
      gsap.to(".blog-card", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".blog-grid",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [posts]);

  return (
    <Bounded>
      <section ref={sectionRef} className="pt-24">
        <div className="pb-8 space-y-5">
          <div className="blog-text">
            <TitleTag tag="Blog" />
          </div>
          <div className="blog-text flex items-end justify-between">
            <h2 className="text-primary font-archivo text-[60px] leading-17.5 font-bold">
              Read some article
            </h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5">
              <FlipLink
                href="/blogs"
                className="text-lg font-medium text-black"
                hoverColor="#000"
              >
                View All Blog
              </FlipLink>
              <ArrowDownRight className="h-5 w-5 text-black" />
            </div>
          </div>
        </div>

        <div className="blog-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 py-16">
          {posts.map((post) => (
            <div key={post.id} className="blog-card">
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </section>
    </Bounded>
  );
};

export default BlogsClient;
