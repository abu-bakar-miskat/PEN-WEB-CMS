import { createClient } from "@/lib/supabase/server";
import { getUserRoleInfo } from "./getUserRole";

export interface Website {
  id: string;
  title?: string;
  name?: string;
  institution_id?: number;
  [key: string]: unknown;
}

/**
 * Get websites with details based on user role
 * - Administrators see all websites
 * - Other users see only websites from their assigned institutions (matching company group)
 */
export async function getWebsitesByUserRole(): Promise<Website[]> {
  const supabase = await createClient();
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  let websites: Website[] = [];
  // Only administrators have full access
  if (isAdministrator) {
    const { data: allWebsites } = await supabase
      .from("websites")
      .select("*")
      .order("title", { ascending: true });

    if (allWebsites) {
      websites = allWebsites as Website[];
    }
    return websites;
  }

  if (userRole && userCompany) {
    const { data: filteredInstitutions } = await supabase
      .from("Institutions")
      .select("id")
          .eq("group", userCompany);
    if (filteredInstitutions && filteredInstitutions.length > 0) {
      const institutionIds = filteredInstitutions.map((inst) => inst.id);

      const { data: institutionWebsites } = await supabase
        .from("websites")
        .select("*")
        .in("institution_id", institutionIds)
        .order("title", { ascending: true });

      if (institutionWebsites) {
        websites = institutionWebsites as Website[];
      }
    }
  }

  return websites;
}
