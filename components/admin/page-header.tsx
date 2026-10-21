import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function AdminCard({ title, description, children, className, actions }: {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <section className={cn("rounded-2xl border bg-card", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="space-y-0.5">
            {title && <h2 className="font-medium">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/** Shown when a table this page needs hasn't been created yet. */
export function MigrationNotice({ file }: { file: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm">
      Run <code className="font-mono">supabase/migrations/{file}</code> in the Supabase SQL editor to enable this page.
    </div>
  )
}
