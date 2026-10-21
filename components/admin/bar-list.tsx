import type { ReactNode } from "react"

// Ranked list with a thin magnitude bar under each label. The numbers are always visible, so the
// list doubles as its own table view.
export function BarList({
  items,
  formatLabel = (label) => label,
  empty = "No data yet.",
  unit = "views",
}: {
  items: { label: string; views: number }[]
  formatLabel?: (label: string) => ReactNode
  empty?: ReactNode
  unit?: string
}) {
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
  const max = Math.max(...items.map((item) => item.views))

  return (
    <ul className="space-y-3" aria-label={`Ranked by ${unit}`}>
      {items.map((item) => (
        <li key={item.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{formatLabel(item.label)}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{item.views.toLocaleString("en-US")}</span>
          </div>
          <div className="h-1.5 rounded-r-[4px] bg-brand" style={{ width: `${Math.max(2, (item.views / max) * 100)}%` }} aria-hidden />
        </li>
      ))}
    </ul>
  )
}
