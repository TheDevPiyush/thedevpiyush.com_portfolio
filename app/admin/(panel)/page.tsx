import Link from "next/link"
import { ArrowRight, Eye, IndianRupee, Inbox, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminCard, AdminPageHeader, MigrationNotice } from "@/components/admin/page-header"
import { StatTile, formatInr, percentChange } from "@/components/admin/stat-tile"
import { TrafficChart } from "@/components/admin/charts"
import { BarList } from "@/components/admin/bar-list"
import { getDashboardData } from "@/lib/admin/analytics"
import { getAdminProfile } from "@/lib/admin/queries"

export const metadata = { title: "Dashboard" }

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()))
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

const ago = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  const hours = Math.round(minutes / 60)
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
}

export default async function DashboardPage() {
  const [data, profile] = await Promise.all([getDashboardData(), getAdminProfile()])
  const firstName = profile?.name?.split(" ")[0]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Here's how the site is doing this week."
        className="mb-2"
        actions={
          <>
            <Button asChild variant="outline" size="pill-sm">
              <Link href="/admin/projects/new">
                <Plus /> Project
              </Link>
            </Button>
            <Button asChild variant="brand" size="pill-sm">
              <Link href="/admin/posts/new">
                <Plus /> New post
              </Link>
            </Button>
          </>
        }
      />

      {data.traffic.unavailable && <MigrationNotice file="0004_admin.sql" />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Page views · 7 days"
          value={data.traffic.views.toLocaleString("en-US")}
          change={percentChange(data.traffic.views, data.previousViews)}
          footnote="vs the week before"
          icon={<Eye />}
        />
        <StatTile
          label="Visitors · 7 days"
          value={data.traffic.visitors.toLocaleString("en-US")}
          change={percentChange(data.traffic.visitors, data.previousVisitors)}
          footnote="unique per day"
          icon={<Users />}
        />
        <StatTile
          label="Revenue · 30 days"
          value={formatInr(data.revenue.last30)}
          footnote={`${data.revenue.sales30} sale${data.revenue.sales30 === 1 ? "" : "s"} · ${formatInr(data.revenue.total)} all time`}
          icon={<IndianRupee />}
        />
        <Link href="/admin/inbox" className="rounded-2xl transition-shadow hover:shadow-sm">
          <StatTile label="Unread messages" value={data.unread} footnote="Open the inbox →" icon={<Inbox />} />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          title="Traffic"
          description="Last 7 days"
          className="lg:col-span-2"
          actions={
            <Link href="/admin/analytics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <TrafficChart data={data.traffic.daily} height={240} />
        </AdminCard>

        <AdminCard title="Content">
          <div className="space-y-6">
            <div className="grid grid-cols-3 divide-x rounded-xl border text-center">
              {[
                { label: "Live", value: data.posts.published, href: "/admin/posts" },
                { label: "Scheduled", value: data.posts.scheduled, href: "/admin/posts" },
                { label: "Drafts", value: data.posts.drafts, href: "/admin/posts" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="px-2 py-3 hover:bg-muted/50">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Most read posts</p>
              <BarList
                items={data.topPosts.map((post) => ({ label: post.title, views: post.view_count ?? 0 }))}
                empty="No views counted yet."
              />
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard title="Top pages" description="Last 7 days">
          <BarList items={data.traffic.pages.slice(0, 6)} formatLabel={(label) => <span className="font-mono text-xs">{label}</span>} />
        </AdminCard>

        <AdminCard
          title="Recent messages"
          actions={
            <Link href="/admin/inbox" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          }
        >
          {data.recentMessages.length ? (
            <ul className="-my-2 divide-y">
              {data.recentMessages.map((message) => (
                <li key={message.id}>
                  <Link href={`/admin/inbox?message=${message.id}`} className="block space-y-0.5 py-2.5 hover:opacity-80">
                    <span className="flex items-center gap-2 text-sm">
                      {message.status === "unread" && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-label="Unread" />}
                      <span className="min-w-0 flex-1 truncate font-medium">{message.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{ago(message.created_at)}</span>
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{message.subject || message.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
        </AdminCard>

        <AdminCard
          title="Recent sales"
          actions={
            <Link href="/admin/sales" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          }
        >
          {data.recentSales.length ? (
            <ul className="-my-2 divide-y">
              {data.recentSales.map((sale) => (
                <li key={sale.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{sale.project ?? "Deleted project"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{sale.email}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block tabular-nums">{formatInr(sale.amount_inr)}</span>
                    <span className="block text-xs text-muted-foreground">{ago(sale.paid_at ?? sale.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
