"use client"

import { useEffect } from "react"
import { IGNORE_ANALYTICS_KEY } from "@/components/analytics/page-view-tracker"

// Opening the admin marks this browser so your own visits to the site aren't counted.
export function IgnoreOwnVisits() {
  useEffect(() => {
    try {
      localStorage.setItem(IGNORE_ANALYTICS_KEY, "1")
    } catch {
      // Storage blocked; nothing to do.
    }
  }, [])
  return null
}
