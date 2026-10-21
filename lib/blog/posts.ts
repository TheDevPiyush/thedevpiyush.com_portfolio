import "server-only"
import { requirePortfolioData } from "@/lib/data/portfolio"
import type { BlogPost } from "@/lib/data/portfolio"
import { tagSlug } from "./post"

// Live posts, newest first (see getBlogPosts in lib/supabase/queries.ts).
export async function getPosts(): Promise<BlogPost[]> {
  return (await requirePortfolioData()).blog
}

export async function getPost(slug: string) {
  const posts = await getPosts()
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return null

  const post = posts[index]
  return {
    post,
    newer: posts[index - 1] ?? null,
    older: posts[index + 1] ?? null,
    related: relatedPosts(post, posts),
  }
}

// Most shared tags first, then most recent; tops up with the latest posts when few tags overlap.
function relatedPosts(post: BlogPost, posts: BlogPost[], limit = 3) {
  const tags = new Set(post.tags.map((tag) => tag.toLowerCase()))
  const others = posts.filter((other) => other.id !== post.id)
  const scored = others
    .map((other) => ({ other, score: other.tags.filter((tag) => tags.has(tag.toLowerCase())).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ other }) => other)

  const picked = scored.slice(0, limit)
  for (const other of others) {
    if (picked.length >= limit) break
    if (!picked.includes(other)) picked.push(other)
  }
  return picked
}

export interface TagSummary {
  slug: string
  name: string
  count: number
}

export async function getTags(): Promise<TagSummary[]> {
  const tags = new Map<string, TagSummary>()
  for (const post of await getPosts()) {
    for (const name of post.tags) {
      const slug = tagSlug(name)
      if (!slug) continue
      const entry = tags.get(slug) ?? { slug, name, count: 0 }
      entry.count += 1
      tags.set(slug, entry)
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export async function getPostsByTag(slug: string) {
  const tag = (await getTags()).find((entry) => entry.slug === slug)
  if (!tag) return null
  const posts = (await getPosts()).filter((post) => post.tags.some((name) => tagSlug(name) === slug))
  return { tag, posts }
}
