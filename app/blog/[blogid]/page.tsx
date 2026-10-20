import Image from "next/image"
import { Calendar, Clock, Tag, ArrowLeft } from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPortfolioData } from "@/lib/data/portfolio"
import type { BlogPost } from "@/lib/data/portfolio"
import type { Metadata } from "next"
import Link from "next/link"

// Force revalidation every 60 seconds (1 minute)
export const revalidate = 60

interface BlogPostPageProps {
    params: {
        blogid: string
    }
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
    try {
        const portfolioData = await getPortfolioData()

        if (!portfolioData.data?.blog) {
            return {
                title: 'Blog Post Not Found - TheDevPiyush',
                description: 'The requested blog post could not be found.',
            }
        }

        const post = portfolioData.data.blog.find((p: BlogPost) => p.url === params.blogid)

        if (!post) {
            return {
                title: 'Blog Post Not Found - TheDevPiyush',
                description: 'The requested blog post could not be found.',
            }
        }

        const publishedDate = new Date(post.publishDate).toISOString()
        const modifiedDate = new Date().toISOString()

        return {
            title: `${post.title} - TheDevPiyush Blog`,
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
                canonical: `https://thedevpiyush.com/blog/${post.url}`,
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
    const portfolioData = await getPortfolioData()

    if (portfolioData.error || !portfolioData.data) {
        return (
            <div className="min-h-screen bg-slate-950">
                <NavigationMenu />
                <div className="pt-16">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Portfolio</h1>
                            <p className="text-slate-300">{portfolioData.error || "Failed to load portfolio data"}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const { blog } = portfolioData.data
    const post = blog.find((p: BlogPost) => p.url === params.blogid)

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-950">
                <NavigationMenu />
                <div className="pt-16">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-400 mb-4">Blog Post Not Found</h1>
                            <p className="text-slate-300">The blog post you're looking for doesn't exist.</p>
                            <Button asChild className="mt-4">
                                <Link href="/blog">Back to Blog</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Generate structured data for the blog post
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image_url,
        "author": {
            "@type": "Person",
            "name": "Piyush Choudhary",
            "url": "https://thedevpiyush.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TheDevPiyush",
            "logo": {
                "@type": "ImageObject",
                "url": "https://thedevpiyush.com/logo.png"
            }
        },
        "datePublished": new Date(post.publishDate).toISOString(),
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://thedevpiyush.com/blog/${post.url}`
        },
        "keywords": post.tags.join(', '),
        "articleSection": "Technology",
        "inLanguage": "en-US"
    }

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="min-h-screen bg-slate-950">
                <NavigationMenu />
                <div className="pt-16">
                    {/* Back Button */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
                            <Link href="/blog" className="flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Blog
                            </Link>
                        </Button>
                    </div>

                    {/* Blog Post Content */}
                    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" itemScope itemType="https://schema.org/BlogPosting">
                        {/* Header */}
                        <header className="mb-12">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 text-slate-400 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <time dateTime={new Date(post.publishDate).toISOString()} itemProp="datePublished">
                                            {new Date(post.publishDate).toLocaleDateString()}
                                        </time>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight" itemProp="headline">{post.title}</h1>

                                <p className="text-xl text-slate-300 leading-relaxed" itemProp="description">{post.excerpt}</p>

                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600/50">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {post.image_url && (
                            <div className="mb-12">
                                <div className="relative aspect-video rounded-2xl overflow-hidden">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        itemProp="image"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="blog-content prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed"
                            itemProp="articleBody"
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />

                        {/* Footer */}
                        <footer className="mt-16 pt-8 border-t border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-slate-400">
                                    <span itemProp="author" itemScope itemType="https://schema.org/Person">
                                        <span itemProp="name">Written by Piyush Choudhary</span>
                                    </span>
                                </div>
                                <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                    <Link href="/blog" className="flex items-center">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Blog
                                    </Link>
                                </Button>
                            </div>
                        </footer>
                    </article>
                </div>
            </div>
        </>
    )
}
