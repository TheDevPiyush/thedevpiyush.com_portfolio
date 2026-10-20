import { supabaseServer } from "@/lib/supabase/server"
import { createSupabaseServerClient } from "@/lib/supabase/ssr"

export interface AuthUser {
  id: string
  email: string | null
}

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) return null
  return authorizationHeader.slice("Bearer ".length).trim() || null
}

// Returns the signed-in user only after Supabase has verified the token (signature + expiry).
// Accepts an `Authorization: Bearer` header, otherwise falls back to the session cookies.
export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  const token = getBearerToken(request?.headers.get("authorization") ?? null)

  const { data, error } = token
    ? await supabaseServer.auth.getUser(token)
    : await (await createSupabaseServerClient()).auth.getUser()

  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email ?? null }
}

export async function ensureUser(userId: string, email?: string | null) {
  const { data: existingUser } = await supabaseServer.from("users").select("*").eq("id", userId).maybeSingle()
  if (existingUser) return existingUser

  const insertPayload: Record<string, string> = { id: userId }
  if (email) insertPayload.email = email

  const { data, error } = await supabaseServer.from("users").insert(insertPayload).select("*").single()
  if (error) throw error
  return data
}

export async function ensureAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseServer.from("users").select("isAdmin").eq("id", userId).maybeSingle()
  if (error || !data) return false
  return Boolean(data.isAdmin)
}

// Verified admin user, or null. Use in admin pages, route handlers and server actions.
export async function requireAdmin(request?: Request): Promise<AuthUser | null> {
  const user = await getAuthUser(request)
  if (!user) return null
  return (await ensureAdmin(user.id)) ? user : null
}
