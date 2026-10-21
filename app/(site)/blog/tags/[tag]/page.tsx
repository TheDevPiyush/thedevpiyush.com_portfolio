import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Container, PageHeader } from "@/components/site/section"
import { WritingList } from "@/components/sections/writing-list"
import { getPostsByTag, getTags } from "@/lib/blog/posts"
import { cn } from "@/lib/utils"

export const revalidate = 300

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return (await getTags()).map((tag) => ({ tag: tag.slug }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const result = await getPostsByTag((await params).tag)
  if (!result) return { title: "Tag not found" }
  const { tag } = result
  return {
    title: `Posts about ${tag.name}`,
    description: `${tag.count} ${tag.count === 1 ? "post" : "posts"} about ${tag.name} by Piyush Choudhary.`,
    alternates: { canonical: `/blog/tags/${tag.slug}` },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const [result, tags] = await Promise.all([getPostsByTag((await params).tag), getTags()])
  if (!result) notFound()
  const { tag, posts } = result

  return (
    <>
      <PageHeader
        eyebrow="Writing · Tag"
        title={
          <>
            {tag.name}{" "}
            <span className="text-gradient">
              · {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </>
        }
      />

      <Container className="pb-24">
        <WritingList posts={posts} />

        <div className="mt-16 space-y-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">All tags</p>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/blog/tags/${entry.slug}`}
                  aria-current={entry.slug === tag.slug ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                    entry.slug === tag.slug
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {entry.name}
                  <span className="opacity-60">{entry.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 pt-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            All posts
          </Link>
        </div>
      </Container>
    </>
  )
}
