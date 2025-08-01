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

export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  // Fix: Use maybeSingle() instead of single() to handle no rows gracefully
  const { data, error } = await supabase.from("personal_info").select("*").maybeSingle()

  if (error) {
    console.error("Error fetching personal info:", error)
    return null
  }

  return data
}

export async function getSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("display_order")

  if (error) {
    console.error("Error fetching skills:", error)
    return []
  }

  return data || []
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").eq("is_active", true).order("display_order")

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data || []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching featured projects:", error)
    return []
  }

  return data || []
}

export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase.from("experiences").select("*").eq("is_active", true).order("display_order")

  if (error) {
    console.error("Error fetching experiences:", error)
    return []
  }

  return data || []
}

export async function getEducation(): Promise<Education | null> {
  const { data, error } = await supabase.from("education").select("*").eq("is_active", true).maybeSingle()

  if (error) {
    console.error("Error fetching education:", error)
    return null
  }

  return data
}

export async function getCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase.from("certifications").select("*").eq("is_active", true).order("display_order")

  if (error) {
    console.error("Error fetching certifications:", error)
    return []
  }

  return data || []
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("publish_date", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }

  return data || []
}

export async function getFeaturedBlogPost(): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .maybeSingle()

  if (error) {
    console.error("Error fetching featured blog post:", error)
    return null
  }

  return data
}

export async function getInterests(): Promise<Interest[]> {
  const { data, error } = await supabase.from("interests").select("*").eq("is_active", true).order("display_order")

  if (error) {
    console.error("Error fetching interests:", error)
    return []
  }

  return data || []
}

export async function getPortfolioStats(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("portfolio_stats")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching portfolio stats:", error)
    return {}
  }

  const stats: Record<string, string> = {}
  data?.forEach((stat: PortfolioStat) => {
    stats[stat.stat_key] = stat.stat_value
  })

  return stats
}

export async function getPortfolioData(): Promise<PortfolioData | null> {
  try {
    const [personal, skills, projects, experience, education, certifications, blog, interests, stats] =
      await Promise.all([
        getPersonalInfo(),
        getSkills(),
        getProjects(),
        getExperiences(),
        getEducation(),
        getCertifications(),
        getBlogPosts(),
        getInterests(),
        getPortfolioStats(),
      ])

    if (!personal || !education) {
      console.error("Missing required data")
      return null
    }

    return {
      personal,
      skills,
      projects,
      experience,
      education,
      certifications,
      blog,
      interests,
      stats,
    }
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    return null
  }
}

export async function incrementBlogPostViews(postId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_blog_views", { post_id: postId })

  if (error) {
    console.error("Error incrementing blog views:", error)
  }
}
