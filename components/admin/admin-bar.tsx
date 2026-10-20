import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Stopgap admin header until the Phase 4 sidebar shell replaces these pages.
export function AdminBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 text-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/admin/postblog" className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            New post
          </Link>
          <Link href="/admin/projects" className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            Projects
          </Link>
        </nav>
      </div>
    </header>
  )
}
