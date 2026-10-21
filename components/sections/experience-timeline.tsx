"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { Reveal } from "@/components/motion/reveal"
import type { Experience } from "@/lib/data/portfolio"

// Vertical timeline whose line fills in as the visitor scrolls through it.
export function ExperienceTimeline({ experience, detailed = false }: { experience: Experience[]; detailed?: boolean }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <ol ref={ref} className="relative ml-2 space-y-12 border-l border-border pl-8 sm:ml-0 sm:pl-12">
      <motion.span
        aria-hidden
        style={{ scaleY: progress }}
        className="absolute -left-px top-0 h-full w-px origin-top bg-brand"
      />
      {experience.map((exp) => (
        <li key={exp.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[37px] top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-brand ring-4 ring-brand/15 sm:-left-[53px]"
          />
          <Reveal className="grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-8">
            <div className="space-y-2">
              <h3 className="text-xl font-medium tracking-tight">
                {exp.title} <span className="text-muted-foreground">at</span>{" "}
                <span className="text-2xl">{exp.company}</span>
              </h3>
              <p className="max-w-2xl leading-relaxed text-muted-foreground">{exp.description}</p>
              {detailed && exp.achievements.length > 0 && (
                <ul className="space-y-1.5 pt-2 text-sm text-muted-foreground">
                  {exp.achievements.map((achievement) => (
                    <li key={achievement} className="flex gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
              {exp.technologies.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 pt-2">
                  {exp.technologies.map((tech) => (
                    <li key={tech} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="order-first space-y-1 text-xs text-muted-foreground sm:order-none sm:text-right">
              <p>{exp.period}</p>
              {exp.location && <p>{exp.location}</p>}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
