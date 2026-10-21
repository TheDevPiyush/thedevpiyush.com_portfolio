"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TocHeading } from "@/lib/blog/markdown"

// Highlights the heading currently nearest the top of the viewport.
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    if (!elements.length) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = elements.find((el) => visible.has(el.id))
        if (first) {
          setActive(first.id)
          return
        }
        // Between headings: keep the last one scrolled past.
        const passed = elements.filter((el) => el.getBoundingClientRect().top < 120)
        if (passed.length) setActive(passed[passed.length - 1].id)
      },
      { rootMargin: "-96px 0px -60% 0px" },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function TocLinks({ headings, active, onNavigate }: { headings: TocHeading[]; active: string | null; onNavigate?: () => void }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={cn(heading.depth === 3 && "pl-4")}>
          <a
            href={`#${heading.id}`}
            onClick={onNavigate}
            aria-current={active === heading.id ? "location" : undefined}
            className={cn(
              "block leading-snug transition-colors hover:text-foreground",
              active === heading.id ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

const headingIdsOf = (headings: TocHeading[]) => headings.map((heading) => heading.id)

/** Sticky side column on wide screens. */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [headingIds] = useState(() => headingIdsOf(headings))
  const active = useActiveHeading(headingIds)

  return (
    <nav aria-label="On this page" className="relative border-l pl-5">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">On this page</p>
      <TocLinks headings={headings} active={active} />
    </nav>
  )
}

/** Collapsible version shown above the post on smaller screens. */
export function TableOfContentsDisclosure({ headings }: { headings: TocHeading[] }) {
  const [open, setOpen] = useState(false)

  return (
    <nav aria-label="On this page" className="rounded-2xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        On this page
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t px-5 py-4">
          <TocLinks headings={headings} active={null} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  )
}
