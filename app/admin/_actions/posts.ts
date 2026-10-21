"use server"

import { z } from "zod"
import { ActionError, adminAction, check, checkRow, parse, revalidate } from "@/lib/admin/action"
import { postSchema } from "@/lib/admin/schemas"
import { removePublicUrls } from "@/lib/admin/storage"
import { countWords } from "@/lib/blog/post"
import { CACHE_TAGS } from "@/lib/data/cache-tags"
import { supabaseServer } from "@/lib/supabase/server"

const idSchema = z.string().uuid()

// Creates the post when `id` is null. Returns the saved id and slug.
export async function savePost(id: string | null, values: unknown) {
  return adminAction(async () => {
    const post = parse(postSchema, values)
    const postId = id ? parse(idSchema, id) : null

    let duplicate = supabaseServer.from("blog_posts").select("id").eq("url", post.slug).limit(1)
    if (postId) duplicate = duplicate.neq("id", postId)
    if ((await duplicate).data?.length) throw new ActionError("Another post already uses this URL slug.")

    const minutes = Math.max(1, Math.round(countWords(post.content_md) / 220))
    const payload = {
      title: post.title,
      url: post.slug,
      excerpt: post.excerpt,
      content_md: post.content_md,
      tags: post.tags,
      image_url: post.image_url,
      is_published: post.is_published,
      publish_date: post.publish_date,
      is_featured: post.is_featured,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      read_time: `${minutes} min read`,
    }

    const saved = postId
      ? checkRow(await supabaseServer.from("blog_posts").update(payload).eq("id", postId).select("id,url,updated_at").single())
      : checkRow(await supabaseServer.from("blog_posts").insert(payload).select("id,url,updated_at").single())

    revalidate(CACHE_TAGS.posts)
    return { id: saved.id as string, slug: saved.url as string, updatedAt: saved.updated_at as string }
  })
}

export async function deletePost(id: string) {
  return adminAction(async () => {
    const postId = parse(idSchema, id)
    const post = checkRow(await supabaseServer.from("blog_posts").select("image_url").eq("id", postId).single())
    check(await supabaseServer.from("blog_posts").delete().eq("id", postId))
    await removePublicUrls([post.image_url])
    revalidate(CACHE_TAGS.posts)
    return null
  })
}

export async function setPostPublished(id: string, isPublished: boolean) {
  return adminAction(async () => {
    check(await supabaseServer.from("blog_posts").update({ is_published: isPublished }).eq("id", parse(idSchema, id)))
    revalidate(CACHE_TAGS.posts)
    return null
  })
}
