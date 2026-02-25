import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";
import { createWebsiteForInstitution } from "@/app/admin/actions/websites";
import { ArrowLeft, Globe, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewWebsitePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not authenticated, send to login
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const { isAdministrator } = await getUserRoleInfo();

  // Only administrators can create websites
  if (!isAdministrator) {
    redirect("/");
  }

  // Load institutions list for the select field
  // First get all institutions
  const { data: allInstitutions } = await supabase
    .from("Institutions")
    .select("id, institutionName, group")
    .order("institutionName", { ascending: true });

  // Get all existing websites to find which institutions already have websites
  const { data: existingWebsites } = await supabase
    .from("websites")
    .select("institution_id");

  // Get institution IDs that already have websites
  const institutionsWithWebsites = new Set(
    existingWebsites?.map((w) => w.institution_id) || []
  );

  // Filter out institutions that already have websites
  const institutions = allInstitutions?.filter(
    (inst) => !institutionsWithWebsites.has(inst.id)
  ) || [];

  const createWebsite = async (formData: FormData) => {
    "use server";

    const supabase = await createClient();
    const { isAdministrator } = await getUserRoleInfo();

    if (!isAdministrator) {
      redirect("/");
    }

    const institutionIdValue = formData.get("institution_id");
    const titleValue = (formData.get("title") ?? "").toString().trim();

    if (!institutionIdValue || !titleValue) {
      // Basic validation failure, just reload the form
      redirect("/admin/websites/new");
    }

    const institution_id = Number(institutionIdValue);

    const { data, error } = await createWebsiteForInstitution({
      institution_id,
      title: titleValue,
    });

    if (error || !data) {
      // On error, just go back to root where user can see websites / messages
      redirect("/");
    }

    // Redirect straight to the dashboard for the new website
    redirect(`/admin?website_id=${data.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website Selection
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-purple-100 mr-3">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Create New Website
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Administrators can create a website for any institution.
              </p>
            </div>
          </div>

          {institutions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">
                All institutions already have websites. There are no institutions available to create a new website for.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Website Selection
              </Link>
            </div>
          ) : (
            <form action={createWebsite} className="space-y-6">
              <div>
                <label
                  htmlFor="institution_id"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Institution
                </label>
                <select
                  id="institution_id"
                  name="institution_id"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select an institution
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.institutionName}
                      {inst.group ? ` (${inst.group})` : ""}
                    </option>
                  ))}
                </select>
              </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Website Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Example University Main Site"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Website
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

