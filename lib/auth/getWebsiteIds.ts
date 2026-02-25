import { createClient } from "@/lib/supabase/server";
import { getUserRoleInfo } from "./getUserRole";

export interface WebsiteFilterResult {
  websiteIds: string[];
  institutionIds: number[] | null;
  hasAllAccess: boolean;
}

/**
 * Get website IDs and institution IDs based on user role
 * - Administrators have all access (institutionIds = null)
 * - Other users only see websites from their assigned institutions (matching company group)
 */
export async function getWebsiteIdsByUserRole(): Promise<WebsiteFilterResult> {
  const supabase = await createClient();
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  let websiteIds: string[] = [];
  let institutionIds: number[] | null = null;
  let hasAllAccess = false;

  // Only administrators have full access
  if (isAdministrator) {
    hasAllAccess = true;
    institutionIds = null; // null means no filtering needed
    return { websiteIds: [], institutionIds: null, hasAllAccess: true };
  }

  // Get institutions based on user role and company
  if (userRole && userCompany) {
    // Filter institutions by company group
    const { data: filteredInstitutions } = await supabase
      .from("Institutions")
      .select("id")
      .eq("group", userCompany);

    if (filteredInstitutions && filteredInstitutions.length > 0) {
      institutionIds = filteredInstitutions.map((inst) => inst.id);

      // Get website IDs for the filtered institutions
      const { data: institutionWebsites } = await supabase
        .from("websites")
        .select("id")
        .in("institution_id", institutionIds);

      if (institutionWebsites && institutionWebsites.length > 0) {
        websiteIds = institutionWebsites.map((w) => w.id);
      }
    } else {
      // No institutions found for this company
      institutionIds = [];
    }
  } else {
    // No role or company assigned, no access
    institutionIds = [];
  }
console.log("websiteIds", websiteIds);
console.log("institutionIds", institutionIds);
console.log("hasAllAccess", hasAllAccess);
  return { websiteIds, institutionIds, hasAllAccess: false };
}
