import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/ssr"
import { safeNextPath } from "@/lib/auth/safe-next"

// OAuth (Google) lands here with ?code=…; exchange it for a cookie session, then continue to ?next=.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNextPath(searchParams.get("next"))

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  const failed = new URL("/signin", origin)
  failed.searchParams.set("error", searchParams.get("error_description") || "Google sign-in failed. Please try again.")
  failed.searchParams.set("next", next)
  return NextResponse.redirect(failed)
}
