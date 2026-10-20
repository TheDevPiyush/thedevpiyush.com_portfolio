import { NextResponse } from "next/server"
import { getCachedProjects, getCachedFeaturedProjects } from "@/lib/data/cached"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")

    const data = featured === "true" ? await getCachedFeaturedProjects() : await getCachedProjects()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
