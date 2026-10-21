export type PostStatus = "draft" | "scheduled" | "published"

// Status is derived: drafts aren't published; published posts dated in the future are scheduled.
export function postStatus(post: { is_published: boolean; publish_date: string }, now = Date.now()): PostStatus {
  if (!post.is_published) return "draft"
  return new Date(post.publish_date).getTime() > now ? "scheduled" : "published"
}

export const STATUS_STYLES: Record<PostStatus, string> = {
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  scheduled: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  draft: "border-border bg-muted text-muted-foreground",
}
