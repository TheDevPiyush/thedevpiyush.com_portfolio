import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { requirePortfolioData } from "@/lib/data/portfolio"
import { Container, PageHeader, Section } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { WritingList } from "@/components/sections/writing-list"
import { formatDate } from "@/lib/formatters/date"

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and essays on web development, backend engineering, Web3 and building software that lasts.",
  alternates: { canonical: "/blog" },
}

export default async function BlogPage() {
  const { blog } = await requirePortfolioData()
  const featured = blog.find((post) => post.featured) ?? blog[0]
  const rest = blog.filter((post) => post !== featured)

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
              href={`/blog/${featured.url}`}
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

      {rest.length > 0 && (
        <Section eyebrow="Archive" title="All posts">
          <WritingList posts={rest} />
        </Section>
      )}
    </>
  )
}
