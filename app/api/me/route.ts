import { NextRequest, NextResponse } from "next/server"
import { ensureUser, getAuthUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

// Returns the verified signed-in user's profile row, creating it on first sign-in.
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await ensureUser(authUser.id, authUser.email)
    return NextResponse.json({
      user: { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin) },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load user" },
      { status: 500 },
    )
  }
}
