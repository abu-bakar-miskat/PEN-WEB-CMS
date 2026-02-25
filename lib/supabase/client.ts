import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_CMS!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY_CMS!
  );
}
