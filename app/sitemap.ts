import type { MetadataRoute } from "next"
import { getPortfolioData } from "@/lib/data/portfolio"
import { SITE_URL } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getPortfolioData()

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.6 },
  ]

  const posts: MetadataRoute.Sitemap = (data?.blog ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.url}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...pages, ...posts]
}
