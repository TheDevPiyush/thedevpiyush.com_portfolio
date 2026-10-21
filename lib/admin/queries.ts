import "server-only"
import { supabaseServer } from "@/lib/supabase/server"
import { resolveSettings } from "@/lib/settings"
import type { BlogPost, PersonalInfo, Project } from "@/lib/supabase/types"
import { ENTITIES, type EntityConfig, type EntityKey } from "./entities"

// Admin reads use the service role (they include drafts, hidden rows and private columns).
// Only call these from pages under app/admin/(panel), whose layout has already checked requireAdmin().

function rows<T>(label: string, result: { data: T[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(`Failed to load ${label}: ${result.error.message}`)
  return result.data ?? []
}

export async function getUnreadMessageCount() {
  const { count, error } = await supabaseServer
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "unread")
  return error ? 0 : (count ?? 0)
}

// ---------- Posts ----------

export type AdminPostRow = Pick<
  BlogPost,
  "id" | "title" | "url" | "excerpt" | "is_published" | "publish_date" | "is_featured" | "view_count" | "updated_at" | "tags"
>

export async function getAdminPosts(): Promise<AdminPostRow[]> {
  return rows(
    "posts",
    await supabaseServer
      .from("blog_posts")
      .select("id,title,url,excerpt,is_published,publish_date,is_featured,view_count,updated_at,tags")
      .order("publish_date", { ascending: false }),
  )
}

export async function getAdminPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseServer.from("blog_posts").select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`Failed to load post: ${error.message}`)
  return data
}

export async function getAllPostTags(): Promise<string[]> {
  const posts = rows("tags", await supabaseServer.from("blog_posts").select("tags"))
  return [...new Set(posts.flatMap((post: { tags: string[] | null }) => post.tags ?? []))].sort()
}

// ---------- Projects ----------

export type AdminProject = Project & { download_file_path: string | null }

export async function getAdminProjects(): Promise<AdminProject[]> {
  return rows("projects", await supabaseServer.from("projects").select("*").order("display_order"))
}

export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const { data, error } = await supabaseServer.from("projects").select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`Failed to load project: ${error.message}`)
  return data
}

export async function getProjectCategories(): Promise<string[]> {
  const projects = rows("categories", await supabaseServer.from("projects").select("category"))
  return [...new Set(projects.map((project: { category: string | null }) => project.category).filter(Boolean) as string[])].sort()
}

export async function getPaidPurchaseCount(projectId: string) {
  const { count } = await supabaseServer
    .from("project_purchases")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("status", "paid")
  return count ?? 0
}

// ---------- Simple sections (experience, skills, …) ----------

export async function getEntityRows(entity: EntityKey): Promise<Record<string, unknown>[]> {
  const config: EntityConfig = ENTITIES[entity]
  const query = supabaseServer.from(config.table).select("*")
  const ordered = config.sortable
    ? query.order("display_order").order("id")
    : query.order(config.orderBy ?? "id", { ascending: false })
  return rows(config.title.toLowerCase(), await ordered)
}

// ---------- Profile & settings ----------

export async function getAdminProfile(): Promise<PersonalInfo | null> {
  const { data, error } = await supabaseServer.from("personal_info").select("*").limit(1).maybeSingle()
  if (error) throw new Error(`Failed to load profile: ${error.message}`)
  return data
}

export async function getAdminSettings() {
  const { data, error } = await supabaseServer.from("site_settings").select("key,value")
  return { settings: resolveSettings(data ?? []), missingTable: Boolean(error) }
}

// ---------- Inbox ----------

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: "unread" | "read" | "archived" | "spam"
  created_at: string
}

export async function getMessages(): Promise<ContactMessage[]> {
  return rows(
    "messages",
    await supabaseServer
      .from("contact_messages")
      .select("id,name,email,subject,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  )
}

// ---------- Sales ----------

export interface PurchaseRow {
  id: string
  amount_inr: number
  status: "created" | "paid" | "failed" | "expired" | "refunded"
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  paid_at: string | null
  created_at: string
  user: { email: string } | null
  project: { id: string; title: string } | null
}

export async function getPurchases(): Promise<PurchaseRow[]> {
  const data = rows(
    "purchases",
    await supabaseServer
      .from("project_purchases")
      .select(
        "id,amount_inr,status,razorpay_order_id,razorpay_payment_id,paid_at,created_at,user:users(email),project:projects(id,title)",
      )
      .order("created_at", { ascending: false })
      .limit(1000),
  )
  return data as unknown as PurchaseRow[]
}

// ---------- Users ----------

export interface AdminUserRow {
  id: string
  email: string
  isAdmin: boolean
  created_at: string
  lastSignInAt: string | null
  provider: string | null
  purchases: number
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const [users, purchases, auth] = await Promise.all([
    rows(
      "users",
      await supabaseServer.from("users").select("id,email,isAdmin,created_at").order("created_at", { ascending: false }),
    ),
    rows("purchases", await supabaseServer.from("project_purchases").select("user_id").eq("status", "paid")),
    supabaseServer.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const purchaseCounts = new Map<string, number>()
  for (const { user_id } of purchases as { user_id: string }[]) {
    purchaseCounts.set(user_id, (purchaseCounts.get(user_id) ?? 0) + 1)
  }
  const authById = new Map((auth.data?.users ?? []).map((user) => [user.id, user]))

  return (users as { id: string; email: string; isAdmin: boolean; created_at: string }[]).map((user) => {
    const authUser = authById.get(user.id)
    return {
      ...user,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      provider: authUser?.app_metadata?.provider ?? null,
      purchases: purchaseCounts.get(user.id) ?? 0,
    }
  })
}
