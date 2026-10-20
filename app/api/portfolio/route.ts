import { NextResponse } from "next/server"
import { getCachedPortfolioData } from "@/lib/data/cached"

export async function GET() {
  try {
    const data = await getCachedPortfolioData()

    if (!data) {
      return NextResponse.json({ error: "Portfolio data not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 })
  }
}
