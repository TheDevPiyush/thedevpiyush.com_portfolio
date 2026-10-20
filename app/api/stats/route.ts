import { NextResponse } from "next/server"
import { getCachedPortfolioStats } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedPortfolioStats()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching portfolio stats:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio stats" }, { status: 500 })
  }
}
