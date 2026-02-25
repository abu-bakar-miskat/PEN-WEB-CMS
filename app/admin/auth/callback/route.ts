import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_CMS as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY_CMS as string;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.error("Code parameter is missing");
    return NextResponse.redirect(new URL("/admin/login", requestUrl.origin));
  }

  const cookieStore = await cookies();

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/admin/login?error=auth_failed", requestUrl.origin));
    }
  } catch (err) {
    console.error("Error creating Supabase client:", err);
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/admin", requestUrl.origin));
}
