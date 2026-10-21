import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Rss } from "lucide-react"
import { Container, PageHeader, Section } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { BlogBrowser } from "@/components/blog/blog-browser"
import { getPosts, getTags } from "@/lib/blog/posts"
import { formatDate } from "@/lib/formatters/date"

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and essays on web development, backend engineering, Web3 and building software that lasts.",
  alternates: { canonical: "/blog" },
}

// Matches the posts cache so scheduled posts appear within five minutes.
export const revalidate = 300

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getPosts(), getTags()])
  const featured = posts.find((post) => post.featured) ?? posts[0]
  // Only what the client-side search needs.
  const browsable = posts.map(({ id, slug, title, excerpt, publishDate, readTime, tags }) => ({
    id,
    slug,
    title,
    excerpt,
    publishDate,
    readTime,
    tags,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={
          <>
            Notes & essays <span className="italic text-muted-foreground">on building software.</span>
          </>
        }
        lede="Thoughts on web development, programming practices and lessons learned shipping real products."
      />

      {featured ? (
        <Container className="border-t pt-16">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border bg-card transition-colors hover:border-foreground/20 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto">
                {featured.image_url && (
                  <Image
                    src={featured.image_url}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="text-brand">Featured</span>
                  <span className="h-px w-6 bg-border" aria-hidden />
                  {formatDate(featured.publishDate)} · {featured.readTime}
                </p>
                <h2 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{featured.title}</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  Read the post
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        </Container>
      ) : (
        <Container className="border-t py-24 text-center text-muted-foreground">First post coming soon.</Container>
      )}

      {posts.length > 1 && (
        <Section
          eyebrow="Archive"
          title="All posts"
          action={
            <a
              href="/rss.xml"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Rss className="h-4 w-4" /> RSS feed
            </a>
          }
        >
          <BlogBrowser posts={browsable} tags={tags.map((tag) => tag.name)} />
        </Section>
      )}
    </>
  )
}
