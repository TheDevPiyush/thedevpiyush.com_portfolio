import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/reveal"

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>
}

// Mono eyebrow ("01 — Selected work"), used above serif headings.
export function Eyebrow({ children, index, className }: { children: ReactNode; index?: string; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground", className)}>
      {index && <span className="text-brand">{index}</span>}
      {index && <span className="h-px w-6 bg-border" aria-hidden />}
      {children}
    </p>
  )
}

interface SectionProps {
  id?: string
  eyebrow?: string
  index?: string
  title?: ReactNode
  lede?: ReactNode
  action?: ReactNode
  children?: ReactNode
  className?: string
}

// Standard editorial section: eyebrow, serif title, short lede, optional action on the right.
export function Section({ id, eyebrow, index, title, lede, action, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-20 sm:py-28", className)}>
      <Container>
        {(eyebrow || title) && (
          <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
              {title && <h2 className="text-4xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>}
              {lede && <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>}
            </div>
            {action}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  )
}

// Big serif page title for top-level pages (About, Work, Writing, Contact…).
export function PageHeader({ eyebrow, title, lede, children }: { eyebrow: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="pb-12 pt-16 sm:pb-16 sm:pt-24">
      <Container>
        <div className="max-w-3xl space-y-6">
          <Reveal immediate>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal immediate delay={0.05}>
            <h1 className="text-5xl leading-[0.95] tracking-tight sm:text-7xl">{title}</h1>
          </Reveal>
          {lede && (
            <Reveal immediate delay={0.12}>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
            </Reveal>
          )}
          {children && (
            <Reveal immediate delay={0.18}>
              {children}
            </Reveal>
          )}
        </div>
      </Container>
    </header>
  )
}
