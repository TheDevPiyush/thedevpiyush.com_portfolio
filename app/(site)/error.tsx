"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow } from "@/components/site/section"

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="flex min-h-[60vh] flex-col justify-center gap-6 py-24">
      <Eyebrow>Something went wrong</Eyebrow>
      <h1 className="max-w-2xl text-5xl leading-[0.95] tracking-tight sm:text-6xl">
        This page didn&apos;t load. <span className="text-muted-foreground">Mind trying again?</span>
      </h1>
      <p className="max-w-lg text-muted-foreground">
        It&apos;s probably a temporary hiccup reaching the database. If it keeps happening, let me know.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="brand" size="pill" onClick={reset}>
          <RotateCw />
          Try again
        </Button>
        <Button asChild variant="outline" size="pill">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </Container>
  )
}
