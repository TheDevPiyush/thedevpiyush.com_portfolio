import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
  counter,
}: {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: string
  className?: string
  children: ReactNode
  /** e.g. [42, 160]: shows "42/160" and turns amber past the limit. */
  counter?: [number, number]
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {counter && (
          <span className={cn("text-[11px] text-muted-foreground", counter[0] > counter[1] && "text-amber-600 dark:text-amber-400")}>
            {counter[0]}/{counter[1]}
          </span>
        )}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p data-field-error className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** Sticky bar at the bottom of long forms; appears once there are unsaved changes. */
export function SaveBar({ dirty, saving, onReset, label = "Save changes" }: { dirty: boolean; saving: boolean; onReset?: () => void; label?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-3 rounded-full border bg-background/90 py-2 pl-5 pr-2 shadow-lg backdrop-blur transition-all",
        dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="text-sm text-muted-foreground">You have unsaved changes</span>
      <div className="flex gap-2">
        {onReset && (
          <button type="button" onClick={onReset} className="rounded-full px-3 text-sm text-muted-foreground hover:text-foreground">
            Discard
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : label}
        </button>
      </div>
    </div>
  )
}
