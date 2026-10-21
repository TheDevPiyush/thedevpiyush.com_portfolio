import type { ReactNode } from "react"
import { SiteChrome } from "@/components/site/site-chrome"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteChrome>
      {/* React hoists this into <head>; pages that set their own `alternates` would otherwise drop it. */}
      <link rel="alternate" type="application/rss+xml" title="Piyush Choudhary · Writing" href="/rss.xml" />
      {children}
    </SiteChrome>
  )
}
