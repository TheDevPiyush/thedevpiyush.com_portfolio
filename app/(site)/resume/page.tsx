import type { Metadata } from "next"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, PageHeader } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Piyush Choudhary, full-stack developer.",
  alternates: { canonical: "/resume" },
}

export default function ResumePage() {
  return (
    <>
      <PageHeader
        eyebrow="Resume"
        title={
          <>
            The one-page <span className="text-gradient">version.</span>
          </>
        }
        lede="Experience, skills and education at a glance. Always the latest copy."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="brand" size="pill">
            <a href="/api/resume?download=1">
              <Download />
              Download PDF
            </a>
          </Button>
          <Button asChild variant="outline" size="pill">
            <a href="/api/resume" target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Open in new tab
            </a>
          </Button>
        </div>
      </PageHeader>

      {/* Mobile browsers don't render embedded PDFs well, so the viewer is desktop-only. */}
      <Container className="hidden pb-24 md:block">
        <Reveal className="overflow-hidden rounded-3xl border bg-muted shadow-sm">
          <iframe src="/api/resume#view=FitH" title="Resume PDF" className="h-[85vh] w-full" />
        </Reveal>
      </Container>
    </>
  )
}
