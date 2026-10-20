import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"

// Project ids the signed-in user has paid for, so buy buttons can switch to "Download".
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser) return NextResponse.json({ projectIds: [] })

  const { data, error } = await supabaseServer
    .from("project_purchases")
    .select("project_id")
    .eq("user_id", authUser.id)
    .eq("status", "paid")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ projectIds: [...new Set((data ?? []).map((row) => row.project_id as string))] })
}
