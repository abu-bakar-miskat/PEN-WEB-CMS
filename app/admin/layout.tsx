import { createClient } from "@/lib/supabase/server";
import { getUserRoleInfo } from "@/lib/auth/getUserRole";
import SidebarNav from "./components/SidebarNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication - middleware handles redirects, so if we get here and no session,
  // we're on login/auth routes which should render without sidebar
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not authenticated, render children without sidebar (for login/auth routes)
  if (!session?.user?.id) {
    return <>{children}</>;
  }

  // Get user role and company information
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();

  let institutionName = "Admin Panel";
  let institutions: Array<{ id: number; institutionName: string; group: string | null }> = [];

  // Fetch institutions based on user role and company
  if (userRole) {
    try {
      const { data: fetchedInstitutions } = await supabase
        .from("Institutions")
        .select("id, institutionName, group")
        .order("institutionName", { ascending: true });

      if (fetchedInstitutions) {
        if (isAdministrator || (userCompany && userCompany.toUpperCase() === "DEV")) {
          institutions = fetchedInstitutions as Array<{ id: number; institutionName: string; group: string | null }>;
        } else if (!userCompany) {
          institutions = [];
        } else {
          institutions = fetchedInstitutions.filter(
            (institution) => institution.group === userCompany
          ) as Array<{ id: number; institutionName: string; group: string | null }>;
        }

        if (institutions.length > 0) {
          if (institutions.length === 1) {
            institutionName = institutions[0].institutionName || "Admin Panel";
          } else {
            institutionName = userCompany || "Admin Panel";
          }
        } else {
          institutionName = userCompany || "Admin Panel";
        }
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
      const institutionId = process.env.INSTITUTION_ID;
      if (institutionId) {
        try {
          const { data: institution } = await supabase
            .from("Institutions")
            .select("institutionName")
            .eq("id", institutionId)
            .single();

          if (institution?.institutionName) {
            institutionName = institution.institutionName;
          }
        } catch (err) {
          console.error("Error fetching institution name:", err);
        }
      }
    }
  } else {
    const institutionId = process.env.INSTITUTION_ID;
    if (institutionId) {
      try {
        const { data: institution } = await supabase
          .from("Institutions")
          .select("institutionName")
          .eq("id", institutionId)
          .single();

        if (institution?.institutionName) {
          institutionName = institution.institutionName;
        }
      } catch (error) {
        console.error("Error fetching institution name:", error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white border-r border-slate-200 shadow-sm">
        <div className="h-full px-4 py-6 overflow-y-auto flex flex-col">
          <SidebarNav 
            institutionName={institutionName} 
            userEmail={session.user.email || ""}
          />
        </div>
      </aside>

      <div className="ml-64 p-8">{children}</div>
    </div>
  );
}
