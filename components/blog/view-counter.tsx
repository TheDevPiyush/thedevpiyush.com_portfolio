"use client"

import { useEffect, useState } from "react"

const format = new Intl.NumberFormat("en-US")

// Counts the visit once per reader per day (deduped server-side) and shows the running total.
export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/blog/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (typeof data?.views === "number") setViews(data.views)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [slug])

  if (views === null) return null
  return (
    <span className="animate-in fade-in">
      {" · "}
      {format.format(views)} {views === 1 ? "view" : "views"}
    </span>
  )
}
