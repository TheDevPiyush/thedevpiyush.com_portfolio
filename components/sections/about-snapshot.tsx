import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container, Eyebrow } from "@/components/site/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { CountUp } from "@/components/motion/count-up"
import type { PersonalInfo, PortfolioViewModel } from "@/lib/data/portfolio"

interface AboutSnapshotProps {
  personal: PersonalInfo
  stats: PortfolioViewModel["statList"]
}

export function AboutSnapshot({ personal, stats }: AboutSnapshotProps) {
  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal className="space-y-6">
            <Eyebrow index="02">About</Eyebrow>
            {personal.image && (
              <div className="relative isolate max-w-sm">
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand/30 via-brand-2/20 to-brand-3/20 blur-2xl"
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border bg-muted">
                  <Image
                    src={personal.image}
                    alt={`Portrait of ${personal.name}`}
                    fill
                    sizes="(min-width: 1024px) 384px, 90vw"
                    className="object-cover grayscale transition duration-700 hover:grayscale-0"
                  />
                </div>
              </div>
            )}
          </Reveal>

          <div className="flex flex-col justify-center space-y-10">
            {personal.philosophy && (
              <Reveal>
                <blockquote className="text-4xl leading-[1.1] tracking-tight sm:text-5xl">
                  <span className="text-brand">&ldquo;</span>
                  {personal.philosophy.replace(/^["“]|["”]$/g, "")}
                  <span className="text-brand">&rdquo;</span>
                </blockquote>
              </Reveal>
            )}
            <Reveal delay={0.1} className="space-y-6">
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                {personal.about_me.replace(/^["“]|["”]$/g, "")}
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
              >
                More about me
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
        </div>

        {stats.length > 0 && (
          <Reveal
            as="ul"
            stagger={0.06}
            className="gradient-border mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-3"
          >
            {stats.slice(0, 6).map((stat) => (
              <RevealItem as="li" key={stat.key} className="space-y-2 bg-background p-6 transition-colors hover:bg-brand/[0.04] sm:p-8">
                <CountUp value={stat.value} className="text-gradient block w-fit text-4xl tracking-tight sm:text-5xl" />
                <span className="block text-sm text-muted-foreground">{stat.label}</span>
              </RevealItem>
            ))}
          </Reveal>
        )}
      </Container>
    </section>
  )
}
