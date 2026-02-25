import Bounded from "@/components/shared/Bounded/Bounded";
import BlogCard, { BlogPost } from "./BlogCard";
import FadeUp from "@/components/shared/Animation/FadeUp";

const AllBlogs = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <Bounded>
      <section className="pt-24">
        <FadeUp>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 py-16">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </FadeUp>
      </section>
    </Bounded>
  );
};

export default AllBlogs;
