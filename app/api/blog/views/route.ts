import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase/server"

const bodySchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,200}$/i) })

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless/i
const DEDUPE_SECONDS = 60 * 60 * 24
const COOKIE_PATH = "/api/blog/views"

// Increments a post's view count at most once per browser per day. Returns { views } either way.
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid slug" }, { status: 400 })

  const { slug } = parsed.data
  const cookieName = `pv_${slug}`
  const isBot = BOT_PATTERN.test(request.headers.get("user-agent") ?? "")
  const alreadyCounted = request.cookies.has(cookieName)

  if (isBot || alreadyCounted) {
    const { data } = await supabaseServer
      .from("blog_posts")
      .select("view_count")
      .eq("url", slug)
      .eq("is_published", true)
      .lte("publish_date", new Date().toISOString())
      .maybeSingle()
    return NextResponse.json({ views: data?.view_count ?? null })
  }

  const { data, error } = await supabaseServer.rpc("increment_post_view", { post_slug: slug })
  if (error) {
    // Most likely 0003_blog.sql hasn't been run yet; the page just hides the count.
    console.error("increment_post_view failed:", error.message)
    return NextResponse.json({ views: null })
  }
  if (data === null) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  const response = NextResponse.json({ views: data })
  // Scoped to this endpoint so the cookie isn't sent with every page request.
  response.cookies.set(cookieName, "1", {
    maxAge: DEDUPE_SECONDS,
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
