import { jwtDecode } from "jwt-decode"
import { supabaseServer } from "@/lib/supabase/server"

interface JwtPayload {
  sub: string
  email?: string
}

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null
  if (!authorizationHeader.startsWith("Bearer ")) return null
  return authorizationHeader.replace("Bearer ", "").trim()
}

export function getUserIdFromAuthHeader(authorizationHeader: string | null): string | null {
  const token = getBearerToken(authorizationHeader)
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.sub || null
  } catch {
    return null
  }
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
