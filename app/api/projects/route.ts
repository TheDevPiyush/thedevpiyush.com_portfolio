import { NextResponse } from "next/server"
import { getProjects, getFeaturedProjects } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")

    const data = featured === "true" ? await getFeaturedProjects() : await getProjects()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
