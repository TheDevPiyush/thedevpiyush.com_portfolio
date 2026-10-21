import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { Magnetic } from "@/components/motion/magnetic"
import { CopyEmail } from "@/components/site/copy-email"

export function ContactCta({ email, index }: { email: string; index?: string }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-16 sm:px-14 sm:py-24">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-[100px]" />
          <div className="relative max-w-3xl space-y-8">
            <Eyebrow index={index}>Contact</Eyebrow>
            <h2 className="text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Have an idea? <span className="text-muted-foreground">Let&apos;s build it.</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              I&apos;m open to freelance projects, full-time roles and interesting collaborations. I usually reply within a day.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button asChild variant="brand" size="pill" className="group">
                  <Link href="/contact">
                    Start a conversation
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </Magnetic>
              {email && <CopyEmail email={email} />}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
