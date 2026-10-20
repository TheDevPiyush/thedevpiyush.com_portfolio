import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { requirePortfolioData } from "@/lib/data/portfolio"
import { Section } from "@/components/site/section"
import { Hero } from "@/components/sections/hero"
import { SelectedWork } from "@/components/sections/selected-work"
import { AboutSnapshot } from "@/components/sections/about-snapshot"
import { ExperienceTimeline } from "@/components/sections/experience-timeline"
import { SkillsGrid } from "@/components/sections/skills-grid"
import { WritingList } from "@/components/sections/writing-list"
import { ContactCta } from "@/components/sections/contact-cta"

export const metadata: Metadata = { alternates: { canonical: "/" } }

export default async function HomePage() {
  const { personal, projects, experience, skills, blog, statList } = await requirePortfolioData()
  const selected = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, 4)

  return (
    <>
      <Hero personal={personal} />

      {selected.length > 0 && (
        <Section
          id="work"
          index="01"
          eyebrow="Selected work"
          title="Things I've built"
          lede="A few projects I'm proud of, from production platforms to ready-to-ship codebases."
          action={<ViewAll href="/projects">All projects</ViewAll>}
        >
          <SelectedWork projects={selected} />
        </Section>
      )}

      <AboutSnapshot personal={personal} stats={statList} />

      {experience.length > 0 && (
        <Section index="03" eyebrow="Experience" title="Where I've worked">
          <ExperienceTimeline experience={experience} />
        </Section>
      )}

      {skills.length > 0 && (
        <Section index="04" eyebrow="Toolkit" title="What I work with">
          <SkillsGrid skills={skills} />
        </Section>
      )}

      {blog.length > 0 && (
        <Section
          index="05"
          eyebrow="Writing"
          title="Notes & essays"
          action={<ViewAll href="/blog">All posts</ViewAll>}
        >
          <WritingList posts={blog.slice(0, 4)} />
        </Section>
      )}

      <ContactCta email={personal.email} index="06" />
    </>
  )
}

function ViewAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
