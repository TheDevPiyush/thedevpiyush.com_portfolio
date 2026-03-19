import { NavigationMenu } from "@/components/navigation-menu"
import { HomePage } from "@/components/home-page"
import { getPortfolioData } from "@/lib/data/portfolio"
import { unstable_noStore as noStore } from "next/cache"

// Force revalidation every 60 seconds (1 minute)
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UIHomePage() {
  noStore()
  const portfolioData = await getPortfolioData()
  
  if (portfolioData.error || !portfolioData.data) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NavigationMenu />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Portfolio</h1>
            <p className="text-slate-300">{portfolioData.error || "Failed to load portfolio data"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavigationMenu />
      <HomePage data={portfolioData.data} />
    </div>
  )
}
