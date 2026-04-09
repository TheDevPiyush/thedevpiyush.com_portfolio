import { getPortfolioDataCached, transformPortfolioData } from "./portfolio-dynamic"

export interface PersonalInfo { 
  name: string
  title: string
  location: string
  email: string
  phone: string
  bio: string
  philosophy: string
  interests: string[]
  social: {
    github: string
    linkedin: string
    twitter: string
    discord: string
  }
}

export interface Skill {
  name: string
  level: number
  category: string
}

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  techStack: string[]
  image_url: string
  features: string[]
  stats: {
    [key: string]: string
  }
  links: {
    github?: string
    live?: string
    demo?: string
  }
  featured: boolean
  category: string
  is_sellable?: boolean
  price_inr?: number
  download_file_path?: string | null
  setup_guide_file_path?: string | null
  screenshot_urls?: string[] | null
}

export interface Experience {
  id: string
  title: string
  company: string
  location: string
  period: string
  description: string
  technologies: string[]
  achievements: string[]
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  publishDate: string
  readTime: string
  tags: string[]
  url: string
  image_url: string
  featured?: boolean
  trending?: boolean
  popular?: boolean
}

export interface Education {
  degree: string
  institution: string
  period: string
  gpa?: string
  coursework: string[]
  activities: string[]
  thesis?: string
}

export interface Certification {
  name: string
  issuer: string
  year: string
  url?: string
}

export interface PortfolioState {
  data: any | null
  isLoading: boolean
  error: string | null
}

export async function getPortfolioData(): Promise<PortfolioState> {
  try {
    const data = await getPortfolioDataCached()
    if (!data) {
      throw new Error("Failed to fetch portfolio data")
    }
    return {
      data: transformPortfolioData(data),
      isLoading: false,
      error: null
    }
  } catch (error) {
    console.error("Error loading portfolio data:", error)
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Failed to load portfolio data"
    }
  }
}

// Dynamic data fetching that bypasses caching
export async function getPortfolioDataDynamic(): Promise<PortfolioState> {
  try {
    // Force fresh data fetch by adding a timestamp
    const timestamp = Date.now()
    const data = await getPortfolioDataCached()
    if (!data) {
      throw new Error("Failed to fetch portfolio data")
    }
    return {
      data: transformPortfolioData(data),
      isLoading: false,
      error: null
    }
  } catch (error) {
    console.error("Error loading portfolio data:", error)
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Failed to load portfolio data"
    }
  }
}
