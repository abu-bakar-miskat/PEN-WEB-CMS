import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePageButton from "./delete-page-button";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";
import { togglePagePublish } from "@/app/admin/actions/pages";

export const dynamic = "force-dynamic";

interface PagesPageProps {
  searchParams: Promise<{ website_id?: string }>;
}

export default async function PagesPage({ searchParams }: PagesPageProps) {
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
  let pages: any[] | null = null;
  let error: { message: string } | null = null;

  try {
    
    // Filter by the selected website
    const filterWebsiteIds = [selectedWebsiteId];

    const result = await supabase
      .from("pages")
      .select("*")
      .in("website_id", filterWebsiteIds)
      .order("order_index", { ascending: true });

    pages = result.data;
    error = result.error;
  } catch (err) {
    console.error("Failed to fetch pages:", err);
    error = {
      message: err instanceof Error ? err.message : "Failed to fetch pages",
    };
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    "use server";
    // Use server action with role-based access checks (same pattern as course-management)
    const result = await togglePagePublish(id, currentStatus);
    if (result.error) {
      console.error("Error toggling publish status:", result.error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pages</h1>
        <Link href={selectedWebsiteId ? `/admin/pages/new?website_id=${selectedWebsiteId}` : "/admin/pages/new"}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Page
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">
          {error.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">ID</th>
              <th className="text-left p-4 font-medium text-slate-600">
                Title
              </th>
              <th className="text-left p-4 font-medium text-slate-600">Slug</th>
              <th className="text-left p-4 font-medium text-slate-600">
                Status
              </th>
              <th className="text-left p-4 font-medium text-slate-600">
                Order
              </th>
              <th className="text-left p-4 font-medium text-slate-600">
                API Route
              </th>
              <th className="text-right p-4 font-medium text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages && pages.length > 0 ? (
              pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-slate-100"
                >
                  <td className="p-4">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded">
                      {page.id}
                    </code>
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {page.title}
                  </td>
                  <td className="p-4 text-slate-600">/{page.slug}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{page.order_index}</td>
                  <td className="p-4">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded break-all block">
                      /api/pages/{page.id}
                    </code>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={selectedWebsiteId ? `/admin/pages/${page.id}?website_id=${selectedWebsiteId}` : `/admin/pages/${page.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <form
                        action={togglePublish.bind(
                          null,
                          page.id,
                          page.is_published,
                        )}
                      >
                        <Button variant="ghost" size="sm">
                          {page.is_published ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                      </form>
                      <DeletePageButton
                        pageId={page.id}
                        pageTitle={page.title}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No pages found. Create your first page to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
