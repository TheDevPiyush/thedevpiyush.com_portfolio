import Link from "next/link"
import { ArrowDown, ArrowRight, Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { TextReveal } from "@/components/motion/text-reveal"
import { Magnetic } from "@/components/motion/magnetic"
import type { PersonalInfo } from "@/lib/data/portfolio"
import type { SiteSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

export function Hero({ personal, availability }: { personal: PersonalInfo; availability: SiteSettings["availability"] }) {
  // Set in /admin/settings; an empty label falls back to the profile's "Working at".
  const availabilityLabel = availability.show ? availability.label || personal.working_at : null
  const busy = availability.status === "busy"

  const socials = [
    { label: "GitHub", href: personal.social.github, icon: Github },
    { label: "LinkedIn", href: personal.social.linkedin, icon: Linkedin },
    { label: "X", href: personal.social.twitter, icon: Twitter },
  ].filter((social) => Boolean(social.href))

  return (
    <section className="relative -mt-20 overflow-hidden pt-20">
      <HeroBackdrop />
      <Container className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center pb-24 pt-12">
        {availabilityLabel && (
          <Reveal immediate>
            <p className="mb-8 inline-flex items-center gap-2.5 rounded-full border bg-background/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden",
                    busy ? "bg-amber-500" : "bg-emerald-500",
                  )}
                />
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", busy ? "bg-amber-500" : "bg-emerald-500")} />
              </span>
              {availabilityLabel}
            </p>
          </Reveal>
        )}

        <TextReveal
          text={personal.name}
          mutedFrom={1}
          delay={0.1}
          className="text-[clamp(3.5rem,12vw,9.5rem)] leading-[0.88] tracking-[-0.02em]"
        />

        <Reveal immediate delay={0.45} className="mt-8 max-w-2xl space-y-8">
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            <span className="text-foreground">{personal.title}</span>
            {personal.location && <> based in {personal.location}</>}. {personal.bio}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button asChild variant="brand" size="pill" className="group">
                <Link href="/projects">
                  See my work
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </Magnetic>
            <Button asChild variant="outline" size="pill" className="bg-background/60 backdrop-blur">
              <Link href="/contact">Get in touch</Link>
            </Button>

            {socials.length > 0 && (
              <ul className="ml-1 flex items-center gap-1">
                {socials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal immediate delay={0.9} className="absolute bottom-8 left-5 hidden sm:left-8 sm:block">
          <a
            href="#work"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce motion-reduce:animate-none" />
            Scroll
          </a>
        </Reveal>
      </Container>
    </section>
  )
}

// Faint grid fading out from the top, with a soft brand glow. Pure CSS, no images.
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 [background-image:linear-gradient(hsl(var(--border)/0.6)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.6)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-brand/20 blur-[120px] dark:bg-brand/15" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
