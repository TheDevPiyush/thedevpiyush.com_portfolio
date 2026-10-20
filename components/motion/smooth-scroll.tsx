"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

let lenis: Lenis | null = null

// Lets other components (e.g. "back to top") drive the same smooth scroll.
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: "smooth" })
}

// Inertia scrolling for the public site. Off under prefers-reduced-motion and on touch devices,
// where native scrolling already feels right.
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches
    if (reduceMotion || coarsePointer) return

    const instance = new Lenis({
      lerp: 0.12,
      anchors: { offset: -96 },
      // Let dialogs, sheets, the command menu and any data-lenis-prevent area scroll natively.
      prevent: (node) => Boolean(node.closest?.("[role=dialog], [cmdk-list], [data-lenis-prevent]")),
    })
    lenis = instance

    let frame = requestAnimationFrame(function raf(time) {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    })

    // Radix dialogs/sheets lock scrolling by marking <body>; pause Lenis while they are open.
    const lockObserver = new MutationObserver(() => {
      if (document.body.hasAttribute("data-scroll-locked")) instance.stop()
      else instance.start()
    })
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] })

    return () => {
      lockObserver.disconnect()
      cancelAnimationFrame(frame)
      instance.destroy()
      lenis = null
    }
  }, [])

  // Next resets the native scroll position on navigation; keep Lenis' target in sync with it.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true })
  }, [pathname])

  return null
}
