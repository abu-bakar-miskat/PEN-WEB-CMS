import { createClient } from "@/lib/supabase/server";
import { BlogPost } from "@/components/page-components/blogsPage/BlogCard";
import BlogsClient from "./BlogsClient";

const Blogs = async () => {
  let blogPosts: BlogPost[] = [];
  try {
    const supabase = await createClient();
    const { data: blogs } = await supabase
      .from("blogs")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    blogPosts = (blogs ?? []).map((blog) => ({
      id: String(blog.id),
      title: blog.title ?? "",
      excerpt: blog.subtitle ?? "",
      date: new Date(blog.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      category: blog.categories?.[0] ?? "",
      image: blog.featured_image ?? "/home/blog-1.png",
      slug: blog.slug ?? "",
    }));
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  }

  return <BlogsClient posts={blogPosts} />;
};

export default Blogs;
