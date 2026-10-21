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
        <Reveal className="bg-mesh relative overflow-hidden rounded-[2rem] px-6 py-16 text-white shadow-2xl shadow-brand/25 sm:px-14 sm:py-24">
          {/* Grid texture and a light sweep over the gradient. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(255_255_255/0.18)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.18)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_80%_at_80%_20%,black,transparent)]"
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/20 blur-[100px]" />
          <div className="relative max-w-3xl space-y-8">
            <Eyebrow index={index} className="text-white/75 [&>span:first-child]:bg-none [&>span:first-child]:text-white [&>span:nth-child(2)]:bg-none [&>span:nth-child(2)]:bg-white/50">
              Contact
            </Eyebrow>
            <h2 className="text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Have an idea? <span className="text-white/70">Let&apos;s build it.</span>
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-white/80">
              I&apos;m open to freelance projects, full-time roles and interesting collaborations. I usually reply within a day.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button asChild size="pill" className="group bg-white text-neutral-900 shadow-lg shadow-black/10 hover:bg-white/90">
                  <Link href="/contact">
                    Start a conversation
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </Magnetic>
              {email && (
                <CopyEmail email={email} className="border-white/30 bg-white/10 text-white hover:border-white/60 hover:bg-white/15 hover:text-white" />
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
