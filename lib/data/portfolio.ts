import { cache } from "react"
import { getCachedPortfolioData } from "./cached"
import { transformPortfolioData } from "./transform"

// View-model types are derived from transformPortfolioData so they can never drift from the data.
export type PortfolioViewModel = ReturnType<typeof transformPortfolioData>
export type PersonalInfo = PortfolioViewModel["personal"]
export type Skill = PortfolioViewModel["skills"][number]
export type Project = PortfolioViewModel["projects"][number]
export type Experience = PortfolioViewModel["experience"][number]
export type BlogPost = PortfolioViewModel["blog"][number]
export type Education = PortfolioViewModel["education"]
export type Certification = PortfolioViewModel["certifications"][number]

export interface PortfolioState {
  data: PortfolioViewModel | null
  isLoading: boolean
  error: string | null
}

// Server-only. Cached across requests by tag (lib/data/cached.ts) and deduped within a request by React cache().
export const getPortfolioData = cache(async (): Promise<PortfolioState> => {
  try {
    const data = await getCachedPortfolioData()
    if (!data) {
      throw new Error("Failed to fetch portfolio data")
    }
    return { data: transformPortfolioData(data), isLoading: false, error: null }
  } catch (error) {
    console.error("Error loading portfolio data:", error)
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Failed to load portfolio data",
    }
  }
})
