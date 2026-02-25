import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWebsitesByUserRole } from "@/lib/auth/getWebsites";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";
import { Globe, ArrowRight, LogOut, AlertCircle, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not authenticated, redirect to login
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  // Get user role info
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  // Get websites based on user role
  const websites = await getWebsitesByUserRole();
  const userEmail = session.user.email || "";
  
  // Check if user has a role but no websites
  let hasRoleButNoWebsites = false;
  if (!isAdministrator && userRole && userCompany && websites.length === 0) {
    // Check if there are institutions for this company group
    const { data: filteredInstitutions } = await supabase
      .from("Institutions")
      .select("id")
      .eq("group", userCompany);
    
    // If institutions exist but no websites, show the message
    if (filteredInstitutions && filteredInstitutions.length > 0) {
      hasRoleButNoWebsites = true;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-purple-600 tracking-tight">
                Website Management
              </h1>
            </div>
            
            {/* Right side - User email and Logout */}
            <div className="flex items-center gap-4">
              {userEmail && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-slate-500">Logged in as:</span>
                  <span className="font-medium text-slate-700">{userEmail}</span>
                </div>
              )}
              <form action="/admin/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Admin-only: Create Website */}
          {isAdministrator && (
            <div className="mb-8 flex justify-end">
              <Link
                href="/admin/websites/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Website
              </Link>
            </div>
          )}

          {/* Websites Grid */}
          {websites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Link
                  key={website.id}
                  href={`/admin?website_id=${website.id}`}
                  className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
                    {website.title || `Website ${website.id}`}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Manage content, pages, and settings
                  </p>
                </Link>
              ))}
            </div>
          ) : hasRoleButNoWebsites ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl border border-slate-200 p-12 max-w-md mx-auto">
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No Website Found
                </h3>
                <p className="text-slate-600 mb-6">
                  You have access to institutions, but no websites are currently available in the database for your assigned institutions. Please contact your administrator to create a website.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl border border-slate-200 p-12 max-w-md mx-auto">
                <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No Websites Available
                </h3>
                <p className="text-slate-600 mb-6">
                  You don&apos;t have access to any websites at this time.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Admin Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
