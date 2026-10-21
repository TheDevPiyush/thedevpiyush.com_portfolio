// Cache tags for public portfolio data. Any write to a table must call revalidateTag() with its tag.
export const CACHE_TAGS = {
  profile: "profile",
  skills: "skills",
  projects: "projects",
  experience: "experience",
  education: "education",
  certifications: "certifications",
  posts: "posts",
  interests: "interests",
  stats: "stats",
  settings: "settings",
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS)
