import type { Metadata } from "next"
import { requirePortfolioData } from "@/lib/data/portfolio"
import { Container, PageHeader } from "@/components/site/section"
import { ProjectsBrowser } from "@/components/sections/projects-browser"
import { ContactCta } from "@/components/sections/contact-cta"

export const metadata: Metadata = {
  title: "Work",
  description: "Projects by Piyush Choudhary, from production platforms to complete codebases you can buy and run yourself.",
  alternates: { canonical: "/projects" },
}

export default async function ProjectsPage() {
  const { projects, personal } = await requirePortfolioData()
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)]
  const hasSellable = projects.some((p) => p.is_sellable && p.price_inr)

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={
          <>
            Selected projects, <span className="italic text-muted-foreground">start to ship.</span>
          </>
        }
        lede={
          <>
            Things I&apos;ve designed, built and deployed end to end.
            {hasSellable && " Some of them come as complete codebases you can buy, set up and make your own."}
          </>
        }
      />
      <Container className="border-t pt-16">
        {ordered.length > 0 ? (
          <ProjectsBrowser projects={ordered} />
        ) : (
          <p className="py-24 text-center text-muted-foreground">New projects are on the way.</p>
        )}
      </Container>
      <ContactCta email={personal.email} />
    </>
  )
}
