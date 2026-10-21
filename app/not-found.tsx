import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteChrome } from "@/components/site/site-chrome"
import { Container, Eyebrow } from "@/components/site/section"

export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="flex min-h-[70vh] flex-col justify-center gap-8 py-24">
        <Eyebrow index="404">Page not found</Eyebrow>
        <h1 className="max-w-3xl text-6xl leading-[0.9] tracking-tight sm:text-8xl">
          Oh, you like to explore, <span className="text-muted-foreground">huh?</span>
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          This page doesn&apos;t exist, but plenty of others do. Try{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to jump anywhere.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="brand" size="pill">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="pill" className="group">
            <Link href="/blog">
              Read the blog
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </Container>
    </SiteChrome>
  )
}
