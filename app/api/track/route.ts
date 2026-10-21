import crypto from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase/server"

const bodySchema = z.object({
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(1000).optional(),
})

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless|curl|wget|python|node-fetch/i
// Pages whose visits aren't worth counting.
const IGNORED_PATHS = /^\/(admin|api|auth|signin)(\/|$)/

function deviceFrom(userAgent: string) {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return "tablet"
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile"
  return "desktop"
}

// A visitor id that changes every day and can't be reversed into an IP: hash(daily salt + IP + UA).
function visitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10)
  const secret = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return crypto.createHash("sha256").update(`${secret}:${day}:${ip}:${userAgent}`).digest("hex").slice(0, 32)
}

function referrerHost(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    return host && host !== ownHost?.replace(/^www\./, "") ? host.slice(0, 200) : null
  } catch {
    return null
  }
}

// Page-view beacon from components/analytics/page-view-tracker.tsx. Always answers 204 so it never
// shows up as an error in the visitor's console.
export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? ""
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || BOT_PATTERN.test(userAgent) || IGNORED_PATHS.test(parsed.data.path)) {
    return new NextResponse(null, { status: 204 })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
  const country = request.headers.get("x-vercel-ip-country")

  const { error } = await supabaseServer.from("page_views").insert({
    path: parsed.data.path.split("?")[0].split("#")[0],
    referrer_host: referrerHost(parsed.data.referrer, request.headers.get("host")),
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    device: deviceFrom(userAgent),
    visitor_hash: visitorHash(ip, userAgent),
  })
  // Usually means 0004_admin.sql hasn't been run yet.
  if (error) console.warn("Page view not recorded:", error.message)

  return new NextResponse(null, { status: 204 })
}
