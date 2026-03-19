export interface PersonalInfo {
  id: string
  name: string
  title: string
  location: string
  working_at: string
  email: string
  phone: string
  bio: string
  about_me: string
  philosophy: string
  image?: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  discord_handle: string
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  level: number
  category: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  long_description: string
  tech_stack: string[]
  features: string[]
  stats: Record<string, string>
  github_url?: string
  live_url?: string
  demo_url?: string
  image_url?: string
  is_featured: boolean
  is_sellable?: boolean
  price_inr?: number
  download_file_path?: string | null
  category: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  title: string
  company: string
  location: string
  start_date: string
  end_date?: string
  is_current: boolean
  description: string
  technologies: string[]
  achievements: string[]
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  start_date: string
  end_date?: string
  gpa: string
  coursework: string[]
  activities: string[]
  thesis?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  credential_url?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  publish_date: string
  read_time: string
  tags: string[]
  url?: string
  image_url?: string
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  is_published: boolean
  view_count: number
  display_order: number
  created_at: string
  updated_at: string
}

export interface Interest {
  id: string
  interest: string
  emoji?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface PortfolioStat {
  id: string
  stat_key: string
  stat_value: string
  display_name?: string
  display_order: number
  is_active: boolean
  updated_at: string
}

export interface PortfolioData {
  personal: PersonalInfo
  skills: Skill[]
  projects: Project[]
  experience: Experience[]
  education: Education
  certifications: Certification[]
  blog: BlogPost[]
  interests: Interest[]
  stats: Record<string, string>
}
