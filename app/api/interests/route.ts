import { NextResponse } from "next/server"
import { getCachedInterests } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedInterests()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching interests:", error)
    return NextResponse.json({ error: "Failed to fetch interests" }, { status: 500 })
  }
}
