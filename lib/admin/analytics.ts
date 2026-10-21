import "server-only"
import { supabaseServer } from "@/lib/supabase/server"

// Days are bucketed in this time zone so "today" matches the admin's clock.
export const ANALYTICS_TIMEZONE = process.env.ANALYTICS_TIMEZONE || "Asia/Kolkata"

export interface Breakdown {
  label: string
  views: number
}

export interface TrafficStats {
  views: number
  visitors: number
  daily: { day: string; views: number; visitors: number }[]
  pages: Breakdown[]
  referrers: Breakdown[]
  countries: Breakdown[]
  devices: Breakdown[]
  /** True when page_views doesn't exist yet (0004_admin.sql not run). */
  unavailable: boolean
}

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ANALYTICS_TIMEZONE }).format(date)
}

// Stats for the last `days` days (today included), with every day present in `daily`.
export async function getTrafficStats(days: number): Promise<TrafficStats> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - (days - 1))
  since.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabaseServer.rpc("page_view_stats", { since: since.toISOString(), tz: ANALYTICS_TIMEZONE })
  const stats = (error ? {} : data) as Partial<TrafficStats>

  const byDay = new Map((stats.daily ?? []).map((entry) => [entry.day, entry]))
  const daily = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - 1 - index) * 86_400_000)
    const day = dayKey(date)
    const entry = byDay.get(day)
    return { day, views: Number(entry?.views ?? 0), visitors: Number(entry?.visitors ?? 0) }
  })

  const numbers = (list?: Breakdown[]) => (list ?? []).map((item) => ({ label: item.label, views: Number(item.views) }))

  return {
    views: Number(stats.views ?? 0),
    visitors: Number(stats.visitors ?? 0),
    daily,
    pages: numbers(stats.pages),
    referrers: numbers(stats.referrers),
    countries: numbers(stats.countries),
    devices: numbers(stats.devices),
    unavailable: Boolean(error),
  }
}

export interface DashboardData {
  traffic: TrafficStats
  previousViews: number
  previousVisitors: number
  posts: { published: number; scheduled: number; drafts: number }
  unread: number
  revenue: { total: number; last30: number; sales: number; sales30: number }
  recentMessages: { id: string; name: string; subject: string | null; message: string; status: string; created_at: string }[]
  recentSales: { id: string; amount_inr: number; created_at: string; paid_at: string | null; email: string | null; project: string | null }[]
  topPosts: { id: string; title: string; url: string; view_count: number }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString()

  const [traffic7, traffic14, posts, unread, sales, messages, topPosts] = await Promise.all([
    getTrafficStats(7),
    getTrafficStats(14),
    supabaseServer.from("blog_posts").select("is_published,publish_date"),
    supabaseServer.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread"),
    supabaseServer
      .from("project_purchases")
      .select("id,amount_inr,created_at,paid_at,user:users(email),project:projects(title)")
      .eq("status", "paid")
      .order("paid_at", { ascending: false, nullsFirst: false }),
    supabaseServer
      .from("contact_messages")
      .select("id,name,subject,message,status,created_at")
      .neq("status", "spam")
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseServer
      .from("blog_posts")
      .select("id,title,url,view_count")
      .eq("is_published", true)
      .order("view_count", { ascending: false })
      .limit(5),
  ])

  // The 7 days before this week, for the change figures.
  const lastWeek = traffic14.daily.slice(0, 7)
  const sum = (list: typeof lastWeek, key: "views" | "visitors") => list.reduce((total, day) => total + day[key], 0)

  const postRows = (posts.data ?? []) as { is_published: boolean; publish_date: string }[]
  const paid = (sales.data ?? []) as unknown as {
    id: string
    amount_inr: number
    created_at: string
    paid_at: string | null
    user: { email: string } | null
    project: { title: string } | null
  }[]
  const recentPaid = paid.filter((sale) => (sale.paid_at ?? sale.created_at) >= monthAgo)

  return {
    traffic: traffic7,
    previousViews: sum(lastWeek, "views"),
    previousVisitors: sum(lastWeek, "visitors"),
    posts: {
      published: postRows.filter((post) => post.is_published && new Date(post.publish_date) <= now).length,
      scheduled: postRows.filter((post) => post.is_published && new Date(post.publish_date) > now).length,
      drafts: postRows.filter((post) => !post.is_published).length,
    },
    unread: unread.count ?? 0,
    revenue: {
      total: paid.reduce((total, sale) => total + Number(sale.amount_inr), 0),
      last30: recentPaid.reduce((total, sale) => total + Number(sale.amount_inr), 0),
      sales: paid.length,
      sales30: recentPaid.length,
    },
    recentMessages: (messages.data ?? []) as DashboardData["recentMessages"],
    recentSales: paid.slice(0, 5).map((sale) => ({
      id: sale.id,
      amount_inr: Number(sale.amount_inr),
      created_at: sale.created_at,
      paid_at: sale.paid_at,
      email: sale.user?.email ?? null,
      project: sale.project?.title ?? null,
    })),
    topPosts: (topPosts.data ?? []) as DashboardData["topPosts"],
  }
}
