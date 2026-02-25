import { createClient } from "@/lib/supabase/server";
import { Plus, ArrowRight, Globe, FileText, BookOpen, Layers, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";

export const dynamic = "force-dynamic";

interface AdminDashboardProps {
  searchParams: Promise<{ website_id?: string }>;
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const params = await searchParams;
  const selectedWebsiteId = params?.website_id;
  
  if (!selectedWebsiteId) {
    redirect("/");
  }
  
  const supabase = await createClient();
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  const { data: websiteData, error: websiteError } = await supabase
    .from("websites")
    .select("id, institution_id, title")
    .eq("id", selectedWebsiteId)
    .single();
  
  if (websiteError || !websiteData) {
    notFound();
  }
  
  if (isAdministrator) {
  } else {
    if (!userRole || !userCompany) {
      notFound();
    }
    
    const { data: institution, error: institutionError } = await supabase
      .from("Institutions")
      .select("group")
      .eq("id", websiteData.institution_id)
      .single();
    
    if (institutionError || !institution) {
      notFound();
    }
    
    if (institution.group !== userCompany) {
      notFound();
    }
  }
  
  const validWebsiteId = selectedWebsiteId;
  const websiteName = websiteData.title || selectedWebsiteId;
  
  let totalPages = 0;
  let totalBlogs = 0;
  let totalSections = 0;

  try {
    
    const filterWebsiteIds = [selectedWebsiteId];

    const { count: pagesCount } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .in("website_id", filterWebsiteIds);
    totalPages = pagesCount || 0;

    const { count: blogsCount } = await supabase
      .from("blogs")
      .select("*", { count: "exact", head: true })
      .in("website_id", filterWebsiteIds);
    totalBlogs = blogsCount || 0;

    const { data: pages } = await supabase
      .from("pages")
      .select("sections")
      .in("website_id", filterWebsiteIds);
    
    if (pages && pages.length > 0) {
      totalSections = pages.reduce((count, page) => {
        if (page.sections) {
          let sections: unknown[] = [];
          if (typeof page.sections === 'string') {
            try {
              sections = JSON.parse(page.sections);
            } catch {
              sections = [];
            }
          } else if (Array.isArray(page.sections)) {
            sections = page.sections;
          }
          return count + sections.length;
        }
        return count;
      }, 0);
    } else {
      totalSections = 0;
    }
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
  }

  // Helper to build URLs with website_id parameter
  const buildUrl = (path: string) => {
    if (validWebsiteId) {
      return `${path}${path.includes('?') ? '&' : '?'}website_id=${validWebsiteId}`;
    }
    return path;
  };

  return (
    <div className="space-y-8">
      {/* Show warning if user doesn't have a role */}
      {!userRole && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                No Role Assigned
              </h3>
              <p className="text-base text-amber-800 mb-3">
                You don&apos;t have a role assigned to your account. Please contact your administrator to get the appropriate permissions.
              </p>
              <p className="text-sm text-amber-700">
                Without a role, you may have limited access to certain features.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Dashboard</h1>
          <p className="text-base text-slate-600">
            {validWebsiteId 
              ? `Overview of content and statistics for ${websiteName}`
              : "Overview of your website content and statistics"}
          </p>
        </div>
        <Link
          href={buildUrl("/admin/pages/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>New Page</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={buildUrl("/admin/pages")}
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1 tracking-tight">
            Total Pages
          </h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {totalPages}
          </p>
          <p className="text-sm text-slate-600">
            {validWebsiteId ? `Pages for ${websiteName}` : "Pages across all websites"}
          </p>
        </Link>

        <Link
          href={buildUrl("/admin/blogs")}
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1 tracking-tight">
            Total Blogs
          </h3>
          <p className="text-3xl font-bold text-teal-600 mb-2">
            {totalBlogs}
          </p>
          <p className="text-sm text-slate-600">
            {validWebsiteId ? `Blog posts for ${websiteName}` : "Blog posts published"}
          </p>
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1 tracking-tight">
            Total Sections
          </h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {totalSections}
          </p>
          <p className="text-sm text-slate-600">
            {validWebsiteId ? `Sections for ${websiteName}` : "Sections used across all pages"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={buildUrl("/admin/pages/new")}
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
            Create New Page
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Add a new page to your website with custom content and sections
          </p>
        </Link>

        <Link
          href={buildUrl("/admin/navigation")}
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Globe className="w-6 h-6 text-indigo-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
            Manage Navigation
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Configure your website navigation menu and footer links
          </p>
        </Link>
      </div>
    </div>
  );
}
