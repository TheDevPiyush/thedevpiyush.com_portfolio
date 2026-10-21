import type { ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

// KPI tile: label, big number, optional change vs the previous period and a footnote.
export function StatTile({
  label,
  value,
  change,
  footnote,
  icon,
}: {
  label: string
  value: ReactNode
  /** Percent change vs the previous period; null hides it. */
  change?: number | null
  footnote?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {icon && <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {change !== undefined && change !== null && Number.isFinite(change) && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium",
              change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            )}
          >
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(Math.round(change))}%
          </span>
        )}
      </div>
      {footnote && <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>}
    </div>
  )
}

export function percentChange(current: number, previous: number) {
  if (!previous) return current ? null : 0
  return ((current - previous) / previous) * 100
}

export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
