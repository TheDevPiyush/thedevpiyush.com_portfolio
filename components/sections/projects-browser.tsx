"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { ArrowUpRight, Check, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BuyProjectButton } from "@/components/buy-project-button"
import { EASE_OUT } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/data/portfolio"

const CATEGORY_LABELS: Record<string, string> = { paid: "For sale" }
const categoryLabel = (category: string) =>
  CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1)

export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => [...new Set(projects.map((project) => project.category).filter(Boolean))], [projects])
  const [filter, setFilter] = useState<string>("all")
  const visible = filter === "all" ? projects : projects.filter((project) => project.category === filter)

  return (
    <LayoutGroup>
      {categories.length > 1 && (
        <div role="tablist" aria-label="Filter projects" className="mb-12 inline-flex flex-wrap gap-1 rounded-full border p-1">
          {["all", ...categories].map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={filter === category}
              onClick={() => setFilter(category)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm transition-colors",
                filter === category ? "text-white" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter === category && (
                <motion.span
                  layoutId="project-filter"
                  className="absolute inset-0 rounded-full bg-gradient-brand shadow-md shadow-brand/30"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">{category === "all" ? "All" : categoryLabel(category)}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="space-y-24 sm:space-y-32">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, index) => (
            <ProjectEntry key={project.id} project={project} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  )
}

function ProjectEntry({ project, index }: { project: Project; index: number }) {
  const flipped = index % 2 === 1
  const stats = project.stats ? Object.entries(project.stats).slice(0, 4) : []
  const links = [
    { label: "Live site", href: project.links.live },
    { label: "Demo", href: project.links.demo },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  return (
    <motion.article
      layout
      id={`project-${project.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      <div className={cn("group relative", flipped && "lg:order-2")}>
        <div aria-hidden className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-brand/25 via-brand-2/20 to-brand-3/15 opacity-40 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="gradient-border relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={`${project.title} preview`}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
              {project.title}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-gradient font-medium">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-gradient-to-r from-brand to-brand-2/0" aria-hidden />
          {project.featured ? "Featured" : categoryLabel(project.category || "project")}
        </div>
        <h2 className="text-4xl leading-[1.05] tracking-tight sm:text-5xl">{project.title}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground">{project.longDescription || project.description}</p>

        {project.features.length > 0 && (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {project.features.slice(0, 6).map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {stats.length > 0 && (
          <dl className="gradient-border grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-4">
            {stats.map(([key, value]) => (
              <div key={key} className="bg-background p-4">
                <dd className="text-gradient w-fit text-2xl">{value}</dd>
                <dt className="text-xs capitalize text-muted-foreground">{key}</dt>
              </div>
            ))}
          </dl>
        )}

        {project.techStack.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li key={tech} className="rounded-full border border-brand/20 bg-brand/[0.06] px-2.5 py-0.5 text-xs text-foreground/80">
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <BuyProjectButton
            projectId={project.id}
            projectTitle={project.title}
            priceInr={project.price_inr}
            isSellable={project.is_sellable}
            setupGuideFilePath={project.setup_guide_file_path}
            screenshotUrls={project.screenshot_urls}
          />
          {project.links.github && (
            <Button asChild variant="outline" size="pill">
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github />
                Source
              </a>
            </Button>
          )}
          {links.map((link) => (
            <Button key={link.label} asChild variant="ghost" size="pill" className="group">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
