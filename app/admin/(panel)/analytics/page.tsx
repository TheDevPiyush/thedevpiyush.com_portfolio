import Link from "next/link"
import { AdminCard, AdminPageHeader, MigrationNotice } from "@/components/admin/page-header"
import { StatTile, percentChange } from "@/components/admin/stat-tile"
import { TrafficChart } from "@/components/admin/charts"
import { BarList } from "@/components/admin/bar-list"
import { getTrafficStats } from "@/lib/admin/analytics"
import { supabaseServer } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export const metadata = { title: "Analytics" }

const RANGES = [7, 30, 90] as const

// "IN" → 🇮🇳 India
const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
function countryLabel(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown"
  const flag = String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65))
  return `${flag} ${regionNames.of(code) ?? code}`
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const requested = Number((await searchParams).days)
  const days = RANGES.includes(requested as (typeof RANGES)[number]) ? requested : 30

  const [current, withPrevious, posts] = await Promise.all([
    getTrafficStats(days),
    getTrafficStats(days * 2),
    supabaseServer.from("blog_posts").select("title,view_count").eq("is_published", true).order("view_count", { ascending: false }).limit(10),
  ])
  const previous = withPrevious.daily.slice(0, days)
  const previousViews = previous.reduce((sum, day) => sum + day.views, 0)
  const previousVisitors = previous.reduce((sum, day) => sum + day.visitors, 0)
  const topSource = current.referrers[0]?.label

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Privacy-friendly: no cookies, no IP addresses, and your own visits aren't counted."
        className="mb-2"
        actions={
          <div className="inline-flex rounded-full border p-0.5 text-sm" role="tablist" aria-label="Date range">
            {RANGES.map((range) => (
              <Link
                key={range}
                href={`/admin/analytics?days=${range}`}
                role="tab"
                aria-selected={days === range}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  days === range ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {range} days
              </Link>
            ))}
          </div>
        }
      />

      {current.unavailable && <MigrationNotice file="0004_admin.sql" />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Page views" value={current.views.toLocaleString("en-US")} change={percentChange(current.views, previousViews)} footnote={`vs the previous ${days} days`} />
        <StatTile label="Visitors" value={current.visitors.toLocaleString("en-US")} change={percentChange(current.visitors, previousVisitors)} footnote="unique per day" />
        <StatTile label="Views per visitor" value={current.visitors ? (current.views / current.visitors).toFixed(1) : "—"} />
        <StatTile label="Top source" value={<span className="block truncate text-2xl">{topSource ?? "Direct"}</span>} footnote={topSource ? `${current.referrers[0].views} views` : "No referrers yet"} />
      </div>

      <AdminCard title="Traffic" description={`Last ${days} days`}>
        <TrafficChart data={current.daily} height={300} />
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Pages">
          <BarList items={current.pages} formatLabel={(label) => <span className="font-mono text-xs">{label}</span>} />
        </AdminCard>
        <AdminCard title="Referrers" description="Sites that sent visitors here">
          <BarList items={current.referrers} empty="No referrers yet. Direct visits and searches without a referrer aren't listed." />
        </AdminCard>
        <AdminCard title="Countries">
          <BarList items={current.countries} formatLabel={countryLabel} />
        </AdminCard>
        <AdminCard title="Devices">
          <BarList items={current.devices} formatLabel={(label) => <span className="capitalize">{label}</span>} />
        </AdminCard>
      </div>

      <AdminCard title="Post views" description="All time, counted once per reader per day">
        <BarList items={(posts.data ?? []).map((post) => ({ label: post.title, views: post.view_count ?? 0 }))} empty="No posts yet." />
      </AdminCard>
    </div>
  )
}
