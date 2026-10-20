import type { ReactNode } from "react"
import { SiteChrome } from "@/components/site/site-chrome"

// Site chrome with a faint grid backdrop that centers an auth card.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <SiteChrome footer={false}>
      <div className="relative -mt-20 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />
        <div className="relative flex min-h-screen items-center justify-center px-4 pb-12 pt-24">{children}</div>
      </div>
    </SiteChrome>
  )
}
