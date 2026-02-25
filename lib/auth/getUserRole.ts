import { createClient } from "@/lib/supabase/server";

export interface UserRoleInfo {
  userRole: string | null;
  userCompany: string | null;
  isAdministrator: boolean;
}

export async function getUserRoleInfo(): Promise<UserRoleInfo> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userCompany: string | null = null;
  let userRole: string | null = null;
  let isAdministrator = false;

  if (session?.user?.id) {
    try {
      const { data: userRights } = await supabase
        .from("Users_Rights")
        .select("role")
        .eq("userId", session.user.id)
        .single();

      userRole = userRights?.role ?? null;
      isAdministrator = userRole?.toLowerCase() === "administrator";

      if (userRole) {
        const { data: roleData, error: roleError } = await supabase
          .from("User_Roles")
          .select("company")
          .eq("access_name", userRole)
          .single();

        if (!roleError && roleData) {
          userCompany = roleData.company;
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  }

  return {
    userRole,
    userCompany,
    isAdministrator,
  };
}
