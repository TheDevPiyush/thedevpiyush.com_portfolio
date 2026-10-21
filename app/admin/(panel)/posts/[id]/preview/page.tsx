import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PostBody } from "@/components/blog/post-body"
import { StatusBadge } from "@/components/admin/status-badge"
import { getAdminPost } from "@/lib/admin/queries"
import { postStatus, STATUS_STYLES } from "@/lib/admin/post-status"
import { toBlogPost } from "@/lib/blog/post"
import { formatDate } from "@/lib/formatters/date"

export const metadata = { title: "Preview" }

// The saved version of any post (drafts included), rendered exactly like the public post body.
export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const row = await getAdminPost(id)
  if (!row) notFound()
  const post = toBlogPost(row)
  const status = postStatus(row)

  return (
    <article className="mx-auto max-w-3xl pb-16">
      <div className="mb-10 flex items-center justify-between gap-3 rounded-full border bg-muted/40 py-2 pl-4 pr-2 text-sm">
        <span className="flex items-center gap-2">
          <StatusBadge className={STATUS_STYLES[status]}>{status}</StatusBadge>
          <span className="text-muted-foreground">Preview of the last saved version</span>
        </span>
        <Link href={`/admin/posts/${id}`} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 hover:bg-background">
          <ArrowLeft className="h-4 w-4" /> Back to editor
        </Link>
      </div>
      <header className="mb-12 space-y-6">
        <p className="font-mono text-xs text-muted-foreground">
          {formatDate(post.publishDate)} · {post.readTime}
        </p>
        <h1 className="text-balance font-serif text-5xl leading-[1] tracking-tight sm:text-6xl">{post.title || "Untitled"}</h1>
        {post.excerpt && <p className="text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- preview of any host
          <img src={post.image_url} alt="" className="aspect-video w-full rounded-3xl border object-cover" />
        )}
      </header>
      <PostBody markdown={post.markdown} html={post.html} />
    </article>
  )
}
