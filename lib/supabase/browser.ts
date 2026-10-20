import { createBrowserClient } from "@supabase/ssr"

// Browser auth client. Session lives in cookies so the server can verify it.
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
