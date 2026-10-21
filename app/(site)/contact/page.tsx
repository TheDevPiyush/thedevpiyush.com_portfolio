import type { Metadata } from "next"
import { ArrowUpRight, Clock, MapPin } from "lucide-react"
import { requirePortfolioData } from "@/lib/data/portfolio"
import { Container, PageHeader } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { CopyEmail } from "@/components/site/copy-email"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Piyush Choudhary about freelance work, full-time roles or collaborations.",
  alternates: { canonical: "/contact" },
}

export default async function ContactPage() {
  const { personal } = await requirePortfolioData()
  const socials = [
    { label: "GitHub", href: personal.social.github },
    { label: "LinkedIn", href: personal.social.linkedin },
    { label: "X / Twitter", href: personal.social.twitter },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href))

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk. <span className="text-muted-foreground">Say hello.</span>
          </>
        }
        lede="Whether you have a project in mind, a role to fill, or just want to chat about tech, I'd love to hear from you."
      />

      <Container className="grid gap-12 border-t pb-24 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="space-y-10">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Email me directly</p>
            <CopyEmail email={personal.email} />
          </div>

          <dl className="divide-y border-y">
            {personal.location && (
              <div className="flex items-center justify-between gap-4 py-4 text-sm">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Location
                </dt>
                <dd>{personal.location}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 py-4 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Response time
              </dt>
              <dd>Usually within a day</dd>
            </div>
          </dl>

          {socials.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Elsewhere</p>
              <ul className="space-y-1">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-xl py-2 text-2xl transition-colors hover:text-brand"
                    >
                      {social.label}
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </Container>
    </>
  )
}
