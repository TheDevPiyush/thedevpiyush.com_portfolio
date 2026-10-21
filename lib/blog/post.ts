import { slug as githubSlug } from "github-slugger"
import type { BlogPost as BlogPostRow } from "../supabase/types"

// Pure row → view-model mapping for posts. Also runs in the browser (terminal), so no server imports.

const WORDS_PER_MINUTE = 220

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ")
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/[`]/g, " "))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`|-]/g, " ")
}

export function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

/** URL segment for a tag: "Web3 Dev" → "web3-dev". */
export function tagSlug(tag: string) {
  return githubSlug(tag)
}

export function toBlogPost(post: BlogPostRow) {
  const markdown = post.content_md?.trim() || null
  // Posts written before 0003_blog.sql only have HTML until scripts/convert-blog-html-to-markdown.mjs runs.
  const html = markdown ? null : post.content?.trim() || null
  const wordCount = countWords(markdown ? stripMarkdown(markdown) : stripHtml(html ?? ""))
  const readingMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))

  return {
    id: post.id,
    slug: post.url || post.id,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags ?? [],
    image_url: post.image_url || null,
    featured: post.is_featured,
    trending: post.is_trending,
    popular: post.is_popular,
    publishDate: post.publish_date,
    updatedAt: post.updated_at || post.publish_date,
    wordCount,
    readingMinutes,
    readTime: `${readingMinutes} min read`,
    seoTitle: post.seo_title || null,
    seoDescription: post.seo_description || null,
    markdown,
    html,
  }
}

export type BlogPostView = ReturnType<typeof toBlogPost>
