import { NextResponse } from "next/server"
import { getCachedExperiences } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedExperiences()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching experience:", error)
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 })
  }
}
