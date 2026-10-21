import type { MetadataRoute } from "next"
import { getPortfolioData } from "@/lib/data/portfolio"
import { tagSlug } from "@/lib/blog/post"
import { SITE_URL } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getPortfolioData()
  const posts = data?.blog ?? []

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: posts[0] && new Date(posts[0].publishDate), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.6 },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const tagPages: MetadataRoute.Sitemap = [...new Set(posts.flatMap((post) => post.tags.map(tagSlug)))].map((slug) => ({
    url: `${SITE_URL}/blog/tags/${slug}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }))

  return [...pages, ...postPages, ...tagPages]
}
