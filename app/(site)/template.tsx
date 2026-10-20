import type { ReactNode } from "react"

// Re-mounts on every navigation, giving each page a short CSS fade-in that doesn't wait for hydration.
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="duration-500 animate-in fade-in motion-reduce:animate-none">{children}</div>
}
