import type { ReactNode } from "react"
import { NavigationMenu } from "@/components/navigation-menu"

// Full-height backdrop (faint grid + accent glow) that centers an auth card.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(var(--color-bg-primary))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgb(var(--color-border-primary)/0.35)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-border-primary)/0.35)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <NavigationMenu />
      <main className="relative flex min-h-screen items-center justify-center px-4 pb-12 pt-24">{children}</main>
    </div>
  )
}
