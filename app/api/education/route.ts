import { NextResponse } from "next/server"
import { getCachedEducation } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedEducation()

    if (!data) {
      return NextResponse.json({ error: "Education data not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching education:", error)
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 })
  }
}
