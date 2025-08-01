import type {
  PortfolioData,
  PersonalInfo,
  Skill,
  Project,
  Experience,
  Education,
  Certification,
  BlogPost,
  Interest,
} from "../supabase/types"

const API_BASE = "/api"

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, { cache: "no-store", next: { revalidate: 0 } })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchPortfolioData(): Promise<PortfolioData | null> {
  try {
    return await apiRequest<PortfolioData>("/portfolio")
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    return null
  }
}

export async function fetchPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    return await apiRequest<PersonalInfo>("/personal")
  } catch (error) {
    console.error("Error fetching personal info:", error)
    return null
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    return await apiRequest<Skill[]>("/skills")
  } catch (error) {
    console.error("Error fetching skills:", error)
    return []
  }
}

export async function fetchProjects(featured?: boolean): Promise<Project[]> {
  try {
    const endpoint = featured ? "/projects?featured=true" : "/projects"
    return await apiRequest<Project[]>(endpoint)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function fetchExperience(): Promise<Experience[]> {
  try {
    return await apiRequest<Experience[]>("/experience")
  } catch (error) {
    console.error("Error fetching experience:", error)
    return []
  }
}

export async function fetchEducation(): Promise<Education | null> {
  try {
    return await apiRequest<Education>("/education")
  } catch (error) {
    console.error("Error fetching education:", error)
    return null
  }
}

export async function fetchCertifications(): Promise<Certification[]> {
  try {
    return await apiRequest<Certification[]>("/certifications")
  } catch (error) {
    console.error("Error fetching certifications:", error)
    return []
  }
}

export async function fetchBlogPosts(featured?: boolean): Promise<BlogPost[] | BlogPost | null> {
  try {
    const endpoint = featured ? "/blog?featured=true" : "/blog"
    return await apiRequest<BlogPost[] | BlogPost>("/blog")
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return featured ? null : []
  }
}

export async function fetchInterests(): Promise<Interest[]> {
  try {
    return await apiRequest<Interest[]>("/interests")
  } catch (error) {
    console.error("Error fetching interests:", error)
    return []
  }
}

export async function fetchPortfolioStats(): Promise<Record<string, string>> {
  try {
    return await apiRequest<Record<string, string>>("/stats")
  } catch (error) {
    console.error("Error fetching portfolio stats:", error)
    return {}
  }
}
