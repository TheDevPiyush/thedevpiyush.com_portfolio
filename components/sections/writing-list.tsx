import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import type { BlogPost } from "@/lib/data/portfolio"
import { formatDate } from "@/lib/formatters/date"

// Compact editorial list of posts: date, title, read time.
export function WritingList({ posts }: { posts: BlogPost[] }) {
  return (
    <Reveal as="ul" stagger={0.06} className="border-t">
      {posts.map((post) => (
        <RevealItem as="li" key={post.id} className="border-b">
          <Link
            href={`/blog/${post.url}`}
            className="group grid gap-2 py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-8"
          >
            <time dateTime={post.publishDate} className="font-mono text-xs text-muted-foreground">
              {formatDate(post.publishDate)}
            </time>
            <div className="space-y-1.5">
              <h3 className="text-lg font-medium tracking-tight transition-colors group-hover:text-brand sm:text-xl">
                {post.title}
              </h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
            <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground sm:inline-flex">
              {post.readTime}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </RevealItem>
      ))}
    </Reveal>
  )
}
