import type { PortfolioData } from "@/lib/supabase/types"
import type { PortfolioState } from "./portfolio"
import { transformPortfolioData } from "./transform"

let portfolioPromise: Promise<PortfolioState> | null = null

// Browser-side loader for the terminal: one /api/portfolio request per page load, shared by all commands.
export function getPortfolioDataClient(): Promise<PortfolioState> {
  portfolioPromise ??= fetch("/api/portfolio")
    .then(async (response) => {
      if (!response.ok) throw new Error("Failed to load portfolio data")
      const raw: PortfolioData = await response.json()
      return { data: transformPortfolioData(raw), isLoading: false, error: null }
    })
    .catch((error) => {
      portfolioPromise = null
      return { data: null, isLoading: false, error: error instanceof Error ? error.message : "Failed to load portfolio data" }
    })

  return portfolioPromise
}
