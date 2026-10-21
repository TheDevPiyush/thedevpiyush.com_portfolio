"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export const IGNORE_ANALYTICS_KEY = "analytics:ignore"

function shouldSkip() {
  try {
    // Set automatically when an admin opens /admin, so your own visits aren't counted.
    if (localStorage.getItem(IGNORE_ANALYTICS_KEY) === "1") return true
  } catch {
    // Storage blocked: count the visit.
  }
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true || window.location.hostname === "localhost"
}

// Sends one anonymous beacon per page view. No cookies, no third parties.
export function PageViewTracker() {
  const pathname = usePathname()
  const firstView = useRef(true)

  useEffect(() => {
    if (shouldSkip()) return
    // The browser referrer is only meaningful for the landing page; later views are internal.
    const referrer = firstView.current ? document.referrer : undefined
    firstView.current = false
    const body = JSON.stringify({ path: pathname, referrer })
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {})
    }
  }, [pathname])

  return null
}
