import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteBlogButton from "./delete-blog-button";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";
import { toggleBlogPublish } from "@/app/admin/actions/blogs";

export const dynamic = "force-dynamic";

interface BlogsPageProps {
  searchParams: Promise<{ website_id?: string }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const selectedWebsiteId = params?.website_id;
  
  // Redirect to base route if no website_id is provided
  if (!selectedWebsiteId) {
    redirect("/");
  }
  
  // Validate website_id before fetching data (outside try-catch to avoid catching notFound error)
  const supabase = await createClient();
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  // First check if website exists in database and get its institution
  const { data: websiteData, error: websiteError } = await supabase
    .from("websites")
    .select("id, institution_id")
    .eq("id", selectedWebsiteId)
    .single();
  
  if (websiteError || !websiteData) {
    // Website doesn't exist in database
    console.error("Website lookup error:", websiteError);
    notFound();
  }
  
  // Administrators have full access - skip access checks
  if (isAdministrator) {
    // Administrator can access any website
  } else {
    // Check if user has access to this website (same pattern as server actions)
    // All other users must match company group
    if (!userRole || !userCompany) {
      // User doesn't have a role or company assigned
      notFound();
    }
    
    // Get the institution's group
    const { data: institution, error: institutionError } = await supabase
      .from("Institutions")
      .select("group")
      .eq("id", websiteData.institution_id)
      .single();
    
    if (institutionError || !institution) {
      console.error("Institution lookup error:", institutionError);
      notFound();
    }
    
    // Check if user's company matches institution's group
    if (institution.group !== userCompany) {
      // User doesn't have access to this website
      notFound();
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let blogs: any[] | null = null;
  let error: { message: string } | null = null;

  try {
    
    // Filter by the selected website
    const filterWebsiteIds = [selectedWebsiteId];

    const result = await supabase
      .from("blogs")
      .select("*")
      .in("website_id", filterWebsiteIds)
      .order("created_at", { ascending: false });

    blogs = result.data;
    error = result.error;
  } catch (err) {
    console.error("Failed to fetch blogs:", err);
    error = {
      message: err instanceof Error ? err.message : "Failed to fetch blogs",
    };
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    "use server";
    // Use server action with role-based access checks (same pattern as course-management)
    const result = await toggleBlogPublish(id, currentStatus);
    if (result.error) {
      console.error("Error toggling publish status:", result.error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blogs</h1>
        <Link href={selectedWebsiteId ? `/admin/blogs/new?website_id=${selectedWebsiteId}` : "/admin/blogs/new"}>
          <Button className="bg-purple-600 hover:bg-purple-700 text-base font-medium px-5 py-2.5 shadow-sm hover:shadow transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add New Blog
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">
          {error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">
                Title
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">
                Subtitle
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">
                Categories
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">Slug</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="text-left p-4 text-sm font-semibold text-slate-700">
                Featured Image
              </th>
              <th className="text-right p-4 text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {blogs && blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr
                  key={blog.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-base font-medium text-slate-900">
                    {blog.title}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{blog.subtitle || "-"}</td>
                  <td className="p-4">
                    {blog.categories &&
                    Array.isArray(blog.categories) &&
                    blog.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {blog.categories.map(
                          (category: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                            >
                              {category}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">/{blog.slug}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        blog.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {blog.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    {blog.featured_image ? (
                      <span className="text-sm text-green-600 font-medium">✓ Yes</span>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={selectedWebsiteId ? `/admin/blogs/${blog.id}?website_id=${selectedWebsiteId}` : `/admin/blogs/${blog.id}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {blog.is_published !== undefined && (
                        <form
                          action={togglePublish.bind(
                            null,
                            blog.id,
                            blog.is_published || false,
                          )}
                        >
                          <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                            {blog.is_published ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                        </form>
                      )}
                      <DeleteBlogButton
                        blogId={blog.id}
                        blogTitle={blog.title}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-base text-slate-500">
                  No blogs found. Create your first blog to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
