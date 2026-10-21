import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function StatusBadge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize", className)}>
      {children}
    </span>
  )
}
