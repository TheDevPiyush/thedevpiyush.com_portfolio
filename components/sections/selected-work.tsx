"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import type { Project } from "@/lib/data/portfolio"

// Editorial project rows. On desktop, hovering a row floats its cover image next to the cursor.
export function SelectedWork({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.4 })

  return (
    <div
      className="relative"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return
        x.set(event.clientX + 24)
        y.set(event.clientY - 110)
      }}
      onPointerLeave={() => setActive(null)}
    >
      <Reveal as="ul" stagger={0.08} className="border-t">
        {projects.map((project, index) => (
          <RevealItem as="li" key={project.id} className="border-b">
            <Link
              href={`/projects#project-${project.id}`}
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(project)}
              className="group relative grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-4 py-8 before:pointer-events-none before:absolute before:inset-y-0 before:-inset-x-4 before:rounded-2xl before:bg-gradient-to-r before:from-brand/[0.07] before:via-brand-2/[0.04] before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 sm:gap-x-8 sm:py-10 md:grid-cols-[3rem_1fr_14rem_auto] md:items-center"
            >
              <span className="text-gradient pt-2 text-xs font-medium md:pt-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 space-y-2">
                <h3 className="text-3xl leading-tight tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-1.5 sm:text-4xl">
                  {project.title}
                </h3>
                <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {project.description}
                </p>
              </div>
              <ul className="col-start-2 flex flex-wrap gap-1.5 md:col-start-auto md:justify-end">
                {project.techStack.slice(0, 3).map((tech) => (
                  <li key={tech} className="rounded-full border border-brand/20 bg-brand/[0.06] px-2.5 py-0.5 text-[11px] text-foreground/80">
                    {tech}
                  </li>
                ))}
              </ul>
              <span className="row-start-1 col-start-3 inline-flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand/30 md:col-start-4">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              {project.image_url && (
                <div className="relative col-span-full aspect-[16/9] overflow-hidden rounded-2xl border bg-muted md:hidden">
                  <Image src={project.image_url} alt="" fill sizes="100vw" className="object-cover" />
                </div>
              )}
            </Link>
          </RevealItem>
        ))}
      </Reveal>

      <AnimatePresence>
        {active?.image_url && (
          <motion.div
            key="preview"
            aria-hidden
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed left-0 top-0 z-40 hidden h-[220px] w-[340px] overflow-hidden rounded-2xl border bg-muted shadow-2xl md:block"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image src={active.image_url} alt="" fill sizes="340px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
