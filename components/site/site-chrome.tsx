import type { ReactNode } from "react"
import { getPortfolioData } from "@/lib/data/portfolio"
import type { SiteChromeData } from "@/lib/site"
import { SmoothScroll } from "@/components/motion/smooth-scroll"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"
import { CommandMenu } from "./command-menu"

export async function getSiteChromeData(): Promise<SiteChromeData | null> {
  const { data } = await getPortfolioData()
  if (!data) return null
  return {
    name: data.personal.name,
    email: data.personal.email,
    social: {
      github: data.personal.social.github || undefined,
      linkedin: data.personal.social.linkedin || undefined,
      twitter: data.personal.social.twitter || undefined,
    },
    projects: data.projects.map((project) => ({ id: project.id, title: project.title })),
    posts: data.blog.map((post) => ({ title: post.title, slug: post.slug })),
  }
}

// Header, ⌘K menu, smooth scrolling and footer shared by every public page.
export async function SiteChrome({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  const data = await getSiteChromeData()

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <SiteHeader />
      <CommandMenu data={data} />
      <main id="main" className="min-h-[70vh] pt-20">
        {children}
      </main>
      {footer && <SiteFooter data={data} />}
    </>
  )
}
