import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Container } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { formatDate } from "@/lib/formatters/date"
import { getPortfolioData } from "@/lib/data/portfolio"
import type { BlogPost } from "@/lib/data/portfolio"
import type { Metadata } from "next"
import Link from "next/link"
import { sanitizeBlogHtml } from "@/lib/sanitize"

// Admin saves purge the posts tag immediately; this is only a fallback.
export const revalidate = 60

interface BlogPostPageProps {
    params: Promise<{
        blogid: string
    }>
}

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
    try {
        const portfolioData = await getPortfolioData()

        if (!portfolioData.data?.blog) {
            return []
        }

        return portfolioData.data.blog.map((post: BlogPost) => ({
            blogid: post.url,
        }))
    } catch (error) {
        console.error('Error generating static params:', error)
        return []
    }
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { blogid } = await params
    try {
        const portfolioData = await getPortfolioData()

        if (!portfolioData.data?.blog) {
            return {
                title: 'Blog Post Not Found - TheDevPiyush',
                description: 'The requested blog post could not be found.',
            }
        }

        const post = portfolioData.data.blog.find((p: BlogPost) => p.url === blogid)

        if (!post) {
            return {
                title: 'Blog Post Not Found - TheDevPiyush',
                description: 'The requested blog post could not be found.',
            }
        }

        const publishedDate = new Date(post.publishDate).toISOString()
        const modifiedDate = new Date().toISOString()

        return {
            title: post.title,
            description: post.excerpt,
            keywords: post.tags.join(', '),
            authors: [{ name: 'Piyush Choudhary' }],
            creator: 'Piyush Choudhary',
            publisher: 'TheDevPiyush',
            formatDetection: {
                email: false,
                address: false,
                telephone: false,
            },
            metadataBase: new URL('https://thedevpiyush.com'),
            alternates: {
                canonical: `/blog/${post.url}`,
            },
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                url: `https://thedevpiyush.com/blog/${post.url}`,
                siteName: 'TheDevPiyush',
                images: post.image_url ? [
                    {
                        url: post.image_url,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    }
                ] : [],
                locale: 'en_US',
                publishedTime: publishedDate,
                modifiedTime: modifiedDate,
                authors: ['Piyush Choudhary'],
                tags: post.tags,
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: post.image_url ? [post.image_url] : [],
                creator: '@thedevpiyush',
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
        return {
            title: 'Blog Post - TheDevPiyush',
            description: 'Blog post by Piyush Choudhary',
        }
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { blogid } = await params
    const portfolioData = await getPortfolioData()
    if (!portfolioData.data) throw new Error(portfolioData.error ?? "Failed to load blog posts")

    const post = portfolioData.data.blog.find((p: BlogPost) => p.url === blogid)
    if (!post) notFound()

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.image_url,
        author: { "@type": "Person", name: "Piyush Choudhary", url: "https://thedevpiyush.com" },
        publisher: {
            "@type": "Organization",
            name: "TheDevPiyush",
            logo: { "@type": "ImageObject", url: "https://thedevpiyush.com/logo.png" },
        },
        datePublished: new Date(post.publishDate).toISOString(),
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://thedevpiyush.com/blog/${post.url}` },
        keywords: post.tags.join(", "),
        inLanguage: "en-US",
    }

    return (
        <>
            <script
                type="application/ld+json"
                // JSON.stringify output can contain "</script>", so escape "<" to keep it inside the tag.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
            />

            <article className="pb-24 pt-12 sm:pt-16">
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
                        </p>
                        <h1 className="font-serif text-5xl leading-[1] tracking-tight sm:text-6xl">{post.title}</h1>
                        <p className="text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
                        {post.tags.length > 0 && (
                            <ul className="flex flex-wrap gap-1.5">
                                {post.tags.map((tag: string) => (
                                    <li key={tag} className="rounded-full border px-3 py-0.5 text-xs text-muted-foreground">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Reveal>
                </Container>

                {post.image_url && (
                    <Container className="mt-12 max-w-5xl">
                        <Reveal immediate delay={0.15} className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted">
                            <Image src={post.image_url} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
                        </Reveal>
                    </Container>
                )}

                <Container className="mt-14 max-w-3xl">
                    <div
                        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-a:text-brand prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content || "") }}
                    />

                    <footer className="mt-16 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Written by <span className="font-serif text-lg italic text-foreground">Piyush Choudhary</span>
                        </p>
                        <Link
                            href="/blog"
                            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            Back to all posts
                        </Link>
                    </footer>
                </Container>
            </article>
        </>
    )
}
