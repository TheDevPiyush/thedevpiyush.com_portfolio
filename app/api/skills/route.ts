import { NextResponse } from "next/server"
import { getCachedSkills } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedSkills()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}
