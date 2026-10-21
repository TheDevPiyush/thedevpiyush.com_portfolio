"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { ADMIN_NAV_ITEMS } from "@/lib/admin/nav"
import { useAdminCommand } from "./admin-command-menu"

const SEGMENT_LABELS: Record<string, string> = { new: "New", preview: "Preview" }

// "/admin/posts/<uuid>" → Dashboard › Posts › Edit
function crumbsFor(pathname: string) {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  const crumbs = [{ label: "Dashboard", href: "/admin" }]
  let href = "/admin"
  for (const segment of segments) {
    href += `/${segment}`
    const navItem = ADMIN_NAV_ITEMS.find((item) => item.href === href)
    crumbs.push({ label: navItem?.title ?? SEGMENT_LABELS[segment] ?? "Edit", href })
  }
  return crumbs
}

export function AdminHeader() {
  const pathname = usePathname()
  const setOpen = useAdminCommand((state) => state.setOpen)
  const crumbs = crumbsFor(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-xl md:rounded-t-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
              <BreadcrumbItem className={index < crumbs.length - 1 ? "hidden sm:inline-flex" : "truncate"}>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <ThemeToggle />
    </header>
  )
}
