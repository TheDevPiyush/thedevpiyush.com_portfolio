import { supabase } from "./client"
import type {
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
  Certification,
  BlogPost,
  Interest,
  PortfolioStat,
  PortfolioData,
} from "./types"
import { DEFAULT_SETTINGS, resolveSettings, type SiteSettings } from "@/lib/settings"

// Raw public reads (anon key). They throw on failure so callers, and especially the cache
// layer in lib/data/cached.ts, never store an error as an empty result.

function unwrap<T>(label: string, result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(`Failed to fetch ${label}: ${result.error.message}`)
  return result.data
}

export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  return unwrap("personal info", await supabase.from("personal_info").select("*").limit(1).maybeSingle())
}

export async function getSkills(): Promise<Skill[]> {
  return unwrap("skills", await supabase.from("skills").select("*").eq("is_active", true).order("display_order")) ?? []
}

// Every public project column except download_file_path, which must stay server-only.
const PUBLIC_PROJECT_COLUMNS =
  "id,title,description,long_description,tech_stack,features,stats,github_url,live_url,demo_url,image_url,is_featured,category,display_order,is_active,is_sellable,price_inr,setup_guide_file_path,screenshot_urls,created_at,updated_at"

export async function getProjects(): Promise<Project[]> {
  return (
    unwrap(
      "projects",
      await supabase.from("projects").select(PUBLIC_PROJECT_COLUMNS).eq("is_active", true).order("display_order"),
    ) ?? []
  )
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((project) => project.is_featured)
}

export async function getExperiences(): Promise<Experience[]> {
  return (
    unwrap("experiences", await supabase.from("experiences").select("*").eq("is_active", true).order("display_order")) ??
    []
  )
}

// Newest first; the About page shows every active entry.
export async function getEducation(): Promise<Education[]> {
  return (
    unwrap(
      "education",
      await supabase.from("education").select("*").eq("is_active", true).order("start_date", { ascending: false }),
    ) ?? []
  )
}

export async function getCertifications(): Promise<Certification[]> {
  return (
    unwrap(
      "certifications",
      await supabase.from("certifications").select("*").eq("is_active", true).order("display_order"),
    ) ?? []
  )
}

// Live posts only: scheduled posts (publish_date in the future) appear once their time passes.
export async function getBlogPosts(): Promise<BlogPost[]> {
  return (
    unwrap(
      "blog posts",
      await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .lte("publish_date", new Date().toISOString())
        .order("publish_date", { ascending: false }),
    ) ?? []
  )
}

// Newest featured post; several posts may be flagged featured.
export async function getFeaturedBlogPost(): Promise<BlogPost | null> {
  return (await getBlogPosts()).find((post) => post.is_featured) ?? null
}

export async function getInterests(): Promise<Interest[]> {
  return (
    unwrap("interests", await supabase.from("interests").select("*").eq("is_active", true).order("display_order")) ?? []
  )
}

export async function getPortfolioStats(): Promise<PortfolioStat[]> {
  return (
    unwrap(
      "portfolio stats",
      await supabase.from("portfolio_stats").select("*").eq("is_active", true).order("display_order"),
    ) ?? []
  )
}

// Missing table (0004_admin.sql not run yet) or a failed read falls back to defaults rather than
// taking the whole site down.
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("key,value")
  if (error) {
    console.warn("Using default site settings:", error.message)
    return DEFAULT_SETTINGS
  }
  return resolveSettings(data ?? [])
}

export async function getPortfolioData(): Promise<PortfolioData | null> {
  const [personal, skills, projects, experience, education, certifications, blog, interests, stats, settings] = await Promise.all([
    getPersonalInfo(),
    getSkills(),
    getProjects(),
    getExperiences(),
    getEducation(),
    getCertifications(),
    getBlogPosts(),
    getInterests(),
    getPortfolioStats(),
    getSiteSettings(),
  ])

  if (!personal) return null

  return { personal, skills, projects, experience, education, certifications, blog, interests, stats, settings }
}
