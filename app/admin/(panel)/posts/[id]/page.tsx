import { notFound } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { getAdminPost, getAllPostTags } from "@/lib/admin/queries"

export const metadata = { title: "Edit post" }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const [post, tags] = await Promise.all([getAdminPost(id), getAllPostTags()])
  if (!post) notFound()

  return (
    <PostEditor
      // A fresh editor per post (the editor keeps its own state).
      key={post.id}
      id={post.id}
      updatedAt={post.updated_at}
      legacyHtml={post.content_md ? null : (post.content ?? null)}
      tagSuggestions={tags}
      initial={{
        title: post.title,
        slug: post.url ?? "",
        excerpt: post.excerpt ?? "",
        content_md: post.content_md ?? "",
        tags: post.tags ?? [],
        image_url: post.image_url ?? "",
        is_published: post.is_published,
        publish_date: new Date(post.publish_date).toISOString(),
        is_featured: post.is_featured,
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
      }}
    />
  )
}
