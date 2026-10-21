import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Container, Section } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { WritingList } from "@/components/sections/writing-list"
import { PostBody } from "@/components/blog/post-body"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { ShareButtons } from "@/components/blog/share-buttons"
import { TableOfContents, TableOfContentsDisclosure } from "@/components/blog/table-of-contents"
import { ViewCounter } from "@/components/blog/view-counter"
import { extractHeadings } from "@/lib/blog/markdown"
import { tagSlug } from "@/lib/blog/post"
import { getPost, getPosts } from "@/lib/blog/posts"
import type { BlogPost } from "@/lib/data/portfolio"
import { formatDate } from "@/lib/formatters/date"
import { AUTHOR, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site"

// Matches the posts cache: scheduled posts go live within five minutes. Admin saves purge it sooner.
export const revalidate = 300

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPost(slug)
  if (!result) return { title: "Post not found" }

  const { post } = result
  const title = post.seoTitle ?? post.title
  const description = post.seoDescription ?? post.excerpt
  const path = `/blog/${post.slug}`

  // The share image comes from ./opengraph-image.tsx.
  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: AUTHOR, url: SITE_URL }],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: new Date(post.publishDate).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [AUTHOR],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description, creator: "@thedevpiyush" },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const result = await getPost(slug)
  if (!result) notFound()

  const { post, newer, older, related } = result
  const headings = post.markdown ? extractHeadings(post.markdown) : []
  const showToc = headings.length >= 2
  const url = absoluteUrl(`/blog/${post.slug}`)
  const edited = formatDate(post.updatedAt) !== formatDate(post.publishDate)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    ...(post.image_url && { image: [post.image_url] }),
    datePublished: new Date(post.publishDate).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    wordCount: post.wordCount,
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: AUTHOR, url: SITE_URL },
    publisher: { "@type": "Person", name: AUTHOR, url: SITE_URL },
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        // JSON.stringify output can contain "</script>", so escape "<" to keep it inside the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <article className="pt-12 sm:pt-16">
        <Container className="max-w-3xl">
          <Reveal immediate className="space-y-8">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              All posts
            </Link>
            <p className="font-mono text-xs text-muted-foreground">
              <time dateTime={new Date(post.publishDate).toISOString()}>{formatDate(post.publishDate)}</time>
              {" · "}
              {post.readTime}
              <ViewCounter slug={post.slug} />
            </p>
            <h1 className="text-balance font-serif text-5xl leading-[1] tracking-tight sm:text-6xl">{post.title}</h1>
            <p className="text-pretty text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
            {post.tags.length > 0 && <TagList tags={post.tags} />}
          </Reveal>
        </Container>

        {post.image_url && (
          <Container className="mt-12 max-w-5xl">
            <Reveal immediate delay={0.15} className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted">
              <Image src={post.image_url} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </Reveal>
          </Container>
        )}

        <Container className="mt-14 max-w-7xl">
          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,44rem)_minmax(0,1fr)] xl:gap-12">
            <aside className="hidden xl:block">
              <div className="sticky top-28 flex flex-col items-end gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Share</p>
                <ShareButtons url={url} title={post.title} className="flex-col" />
              </div>
            </aside>

            <div className="mx-auto min-w-0 max-w-[44rem]">
              {showToc && (
                <div className="mb-12 xl:hidden">
                  <TableOfContentsDisclosure headings={headings} />
                </div>
              )}

              <PostBody markdown={post.markdown} html={post.html} />

              <footer className="mt-16 space-y-8 border-t pt-8">
                {post.tags.length > 0 && <TagList tags={post.tags} />}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Written by <span className="font-serif text-lg italic text-foreground">{AUTHOR}</span>
                    {edited && <span className="block font-mono text-xs">Updated {formatDate(post.updatedAt)}</span>}
                  </p>
                  <ShareButtons url={url} title={post.title} />
                </div>
              </footer>
            </div>

            <aside className="hidden xl:block">
              {showToc && (
                <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pb-6" data-lenis-prevent>
                  <TableOfContents headings={headings} />
                </div>
              )}
            </aside>
          </div>
        </Container>

        {(newer || older) && (
          <Container className="mt-20 max-w-3xl">
            <nav aria-label="More posts" className="grid gap-4 sm:grid-cols-2">
              {older ? <AdjacentPost post={older} direction="older" /> : <span className="hidden sm:block" />}
              {newer && <AdjacentPost post={newer} direction="newer" />}
            </nav>
          </Container>
        )}
      </article>

      {related.length > 0 && (
        <Section eyebrow="Keep reading" title="More writing">
          <WritingList posts={related} />
        </Section>
      )}
    </>
  )
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/blog/tags/${tagSlug(tag)}`}
            className="inline-block rounded-full border px-3 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function AdjacentPost({ post, direction }: { post: BlogPost; direction: "older" | "newer" }) {
  const isNewer = direction === "newer"
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col gap-3 rounded-2xl border p-6 transition-colors hover:border-foreground/20 hover:bg-muted/40 ${isNewer ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {!isNewer && <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />}
        {isNewer ? "Next post" : "Previous post"}
        {isNewer && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
      </span>
      <span className="text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-brand">{post.title}</span>
    </Link>
  )
}
