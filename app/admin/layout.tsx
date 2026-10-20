import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = { robots: { index: false, follow: false } }

// The current admin forms are built for dark mode, so admin stays dark until the Phase 4 rebuild.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="dark min-h-screen bg-background text-foreground">{children}</div>
}
