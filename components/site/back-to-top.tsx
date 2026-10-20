"use client"

import { ArrowUp } from "lucide-react"
import { scrollToTop } from "@/components/motion/smooth-scroll"

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      Back to top
      <ArrowUp className="h-3.5 w-3.5" />
    </button>
  )
}
