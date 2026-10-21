import type { Metadata } from "next"
import Image from "next/image"
import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react"
import { requirePortfolioData } from "@/lib/data/portfolio"
import { Accent, Container, PageHeader, Section } from "@/components/site/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { ExperienceTimeline } from "@/components/sections/experience-timeline"
import { SkillsGrid } from "@/components/sections/skills-grid"
import { ContactCta } from "@/components/sections/contact-cta"

export const metadata: Metadata = {
  title: "About",
  description: "Who I am, how I got into programming, where I've worked and what I work with.",
  alternates: { canonical: "/about" },
}

export default async function AboutPage() {
  const { personal, experience, skills, education, certifications, stats } = await requirePortfolioData()
  const firstName = personal.name.split(" ")[0]

  const facts = [
    { icon: MapPin, label: "Based in", value: personal.location },
    { icon: Briefcase, label: "Currently", value: personal.working_at },
    { icon: Clock, label: "Experience", value: stats.experience ? `${stats.experience} years` : undefined },
  ].filter((fact) => Boolean(fact.value))

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Hi, I&apos;m {firstName}. <span className="text-gradient">I like building things.</span>
          </>
        }
        lede={personal.about_me.replace(/^["“]|["”]$/g, "")}
      />

      <Container>
        <div className="grid gap-12 border-t pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal className="space-y-8">
            {personal.image && (
              <div className="relative aspect-[4/5] max-w-sm overflow-hidden rounded-3xl border bg-muted">
                <Image
                  src={personal.image}
                  alt={`Portrait of ${personal.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 384px, 90vw"
                  className="object-cover"
                />
              </div>
            )}
            <dl className="max-w-sm divide-y border-y">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {label}
                  </dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="space-y-8">
            {personal.story.length > 0 && <h2 className="text-4xl tracking-tight sm:text-5xl">My story</h2>}
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              {personal.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {personal.philosophy && (
              <blockquote className="border-l-2 border-brand pl-6 text-2xl leading-snug sm:text-3xl">
                {personal.philosophy.replace(/^["“]|["”]$/g, "")}
              </blockquote>
            )}
          </Reveal>
        </div>
      </Container>

      {experience.length > 0 && (
        <Section index="01" eyebrow="Experience" title={<>The journey <Accent>so far</Accent></>} lede="Roles that shaped how I build software.">
          <ExperienceTimeline experience={experience} detailed />
        </Section>
      )}

      {skills.length > 0 && (
        <Section index="02" eyebrow="Toolkit" title={<>Skills &amp; <Accent>technologies</Accent></>}>
          <SkillsGrid skills={skills} />
        </Section>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <Section index="03" eyebrow="Education" title={<>Learning, <Accent>formally and otherwise</Accent></>}>
          <div className="grid gap-6 lg:grid-cols-2">
            {education.length > 0 && (
              <Reveal as="ul" stagger={0.08} className="space-y-6">
                {education.map((entry) => (
                  <RevealItem as="li" key={entry.id} className="space-y-5 rounded-3xl border p-6 sm:p-8">
                    <p className="text-xs text-muted-foreground">{entry.period}</p>
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium tracking-tight">{entry.degree}</h3>
                      <p className="text-xl text-muted-foreground">{entry.institution}</p>
                    </div>
                    {entry.gpa && <p className="text-sm text-muted-foreground">GPA {entry.gpa}</p>}
                    {entry.coursework.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5">
                        {entry.coursework.map((course) => (
                          <li key={course} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            {course}
                          </li>
                        ))}
                      </ul>
                    )}
                  </RevealItem>
                ))}
              </Reveal>
            )}

            {certifications.length > 0 && (
              <Reveal as="ul" stagger={0.06} className="h-fit divide-y overflow-hidden rounded-3xl border">
                {certifications.map((cert) => (
                  <RevealItem as="li" key={`${cert.name}-${cert.issuer}`}>
                    <CertificationRow cert={cert} />
                  </RevealItem>
                ))}
              </Reveal>
            )}
          </div>
        </Section>
      )}

      {personal.interests.length > 0 && (
        <Section index="04" eyebrow="Off the clock" title={<>When I&apos;m <Accent>not coding</Accent></>}>
          <Reveal as="ul" stagger={0.05} className="flex flex-wrap gap-3">
            {personal.interests.map((interest) => (
              <RevealItem
                as="li"
                key={interest}
                className="rounded-full border border-brand/20 bg-gradient-to-r from-brand/[0.08] to-brand-2/[0.08] px-5 py-2.5 text-base transition-shadow hover:shadow-md hover:shadow-brand/15"
              >
                {interest}
              </RevealItem>
            ))}
          </Reveal>
        </Section>
      )}

      <ContactCta email={personal.email} index="05" />
    </>
  )
}

function CertificationRow({ cert }: { cert: { name: string; issuer: string; year: string; url?: string } }) {
  const content = (
    <>
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{cert.name}</p>
        <p className="text-sm text-muted-foreground">
          {cert.issuer} · {cert.year}
        </p>
      </div>
      {cert.url && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
    </>
  )

  return cert.url ? (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-accent/50 sm:px-8"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center justify-between gap-4 p-5 sm:px-8">{content}</div>
  )
}
