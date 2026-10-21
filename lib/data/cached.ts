import "server-only"
import { unstable_cache } from "next/cache"
import * as queries from "@/lib/supabase/queries"
import type { PortfolioData } from "@/lib/supabase/types"
import { CACHE_TAGS } from "./cache-tags"

// Admin writes purge entries by tag, so the time-based fallback can be long.
const REVALIDATE_SECONDS = 60 * 60

// Posts re-check sooner so scheduled posts go live within a few minutes of their publish time.
const POSTS_REVALIDATE_SECONDS = 5 * 60

function cached<T>(fn: () => Promise<T>, key: string, tag: string, revalidate = REVALIDATE_SECONDS) {
  return unstable_cache(fn, ["portfolio", key], { tags: [tag], revalidate })
}

export const getCachedPersonalInfo = cached(queries.getPersonalInfo, "personal_info", CACHE_TAGS.profile)
export const getCachedSkills = cached(queries.getSkills, "skills", CACHE_TAGS.skills)
export const getCachedProjects = cached(queries.getProjects, "projects", CACHE_TAGS.projects)
export const getCachedExperiences = cached(queries.getExperiences, "experiences", CACHE_TAGS.experience)
export const getCachedEducation = cached(queries.getEducation, "education", CACHE_TAGS.education)
export const getCachedCertifications = cached(queries.getCertifications, "certifications", CACHE_TAGS.certifications)
export const getCachedBlogPosts = cached(queries.getBlogPosts, "blog_posts", CACHE_TAGS.posts, POSTS_REVALIDATE_SECONDS)
export const getCachedInterests = cached(queries.getInterests, "interests", CACHE_TAGS.interests)
export const getCachedSiteSettings = cached(queries.getSiteSettings, "site_settings", CACHE_TAGS.settings)
export const getCachedPortfolioStats = cached(queries.getPortfolioStats, "portfolio_stats", CACHE_TAGS.stats)

export async function getCachedFeaturedProjects() {
  return (await getCachedProjects()).filter((project) => project.is_featured)
}

export async function getCachedFeaturedBlogPost() {
  return (await getCachedBlogPosts()).find((post) => post.is_featured) ?? null
}

export async function getCachedPortfolioData(): Promise<PortfolioData | null> {
  const [personal, skills, projects, experience, education, certifications, blog, interests, stats, settings] = await Promise.all([
    getCachedPersonalInfo(),
    getCachedSkills(),
    getCachedProjects(),
    getCachedExperiences(),
    getCachedEducation(),
    getCachedCertifications(),
    getCachedBlogPosts(),
    getCachedInterests(),
    getCachedPortfolioStats(),
    getCachedSiteSettings(),
  ])

  if (!personal) return null

  return { personal, skills, projects, experience, education, certifications, blog, interests, stats, settings }
}
