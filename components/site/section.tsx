import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/reveal"

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>
}

/** The highlighted part of a heading, in the brand gradient. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-gradient">{children}</span>
}

// Small uppercase eyebrow ("01 — Selected work"), used above section headings.
export function Eyebrow({ children, index, className }: { children: ReactNode; index?: string; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground", className)}>
      {index && <span className="text-gradient font-medium">{index}</span>}
      {index && <span className="h-px w-8 bg-gradient-to-r from-brand to-brand-2/0" aria-hidden />}
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

// Large page title for top-level pages (About, Work, Writing, Contact…).
export function PageHeader({ eyebrow, title, lede, children }: { eyebrow: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative isolate pb-12 pt-16 sm:pb-16 sm:pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[520px] overflow-hidden">
        <div className="absolute -top-24 right-[-5%] h-[420px] w-[420px] animate-aurora rounded-full bg-brand/20 blur-[110px] motion-reduce:animate-none" />
        <div className="absolute left-[30%] top-0 h-[320px] w-[320px] animate-aurora rounded-full bg-brand-2/15 blur-[110px] [animation-delay:-9s] motion-reduce:animate-none" />
        <div className="absolute inset-0 [background-image:linear-gradient(hsl(var(--border)/0.6)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.6)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_70%_at_70%_0%,black,transparent)]" />
      </div>
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
