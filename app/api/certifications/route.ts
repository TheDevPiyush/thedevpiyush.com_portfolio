import { NextResponse } from "next/server"
import { getCachedCertifications } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedCertifications()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching certifications:", error)
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 })
  }
}
