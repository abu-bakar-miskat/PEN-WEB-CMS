import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  slug: string;
}

const BlogCard = ({ post }: { post: BlogPost }) => {
  return (
    <Link href={`/blogs/${post.slug}`} className="group flex flex-col pb-8">
      <div className="relative aspect-4/4 w-full overflow-hidden rounded-md">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary">
          {post.category}
        </span>
      </div>

      <p className="mt-5 text-xl text-primary-300 font-archivo">{post.date}</p>

      <p className="mt-2 text-base leading-snug text-primary font-semibold font-inter line-clamp-2">
        {post.excerpt}
      </p>
    </Link>
  );
};

export default BlogCard;
