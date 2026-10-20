"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Menu, Search } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { NAV_LINKS, isActivePath } from "@/lib/site"
import { useCommandMenu } from "./command-menu"
import { ThemeToggle } from "./theme-toggle"
import { AccountMenu } from "./account-menu"

// Floating pill nav: full-width and borderless at the top of the page, condensed into a
// bordered pill once the page scrolls.
export function SiteHeader() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const openCommandMenu = useCommandMenu((state) => state.setOpen)

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24))

  const highlighted = hovered ?? NAV_LINKS.find((link) => isActivePath(pathname, link.href))?.href ?? null

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4">
      <motion.nav
        aria-label="Main"
        initial={false}
        animate={scrolled ? "condensed" : "expanded"}
        variants={{
          expanded: { maxWidth: 1152, paddingLeft: 8, paddingRight: 8 },
          condensed: { maxWidth: 760, paddingLeft: 8, paddingRight: 8 },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "flex h-14 w-full items-center justify-between gap-2 rounded-full border transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border/70 bg-background/75 shadow-lg shadow-black/[0.03] backdrop-blur-xl dark:shadow-black/30"
            : "border-transparent bg-transparent",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 font-serif text-xl italic tracking-tight"
          aria-label="TheDevPiyush, home"
        >
          <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
          piyush
        </Link>

        <ul className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href)
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(link.href)}
                  className={cn(
                    "relative z-10 block px-3.5 py-1.5 text-sm transition-colors",
                    active || hovered === link.href ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {link.name}
                </Link>
                {highlighted === link.href && (
                  <motion.span
                    layoutId="nav-highlight"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openCommandMenu(true)}
            className="hidden h-9 items-center gap-2 rounded-full border bg-background/50 pl-3 pr-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            aria-label="Open command menu"
          >
            <Search className="h-3.5 w-3.5" />
            Search
            <kbd className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => openCommandMenu(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground sm:hidden"
            aria-label="Open command menu"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <AccountMenu />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-3xl pb-8 pt-14">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <ul className="space-y-1">
                {NAV_LINKS.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                      className={cn(
                        "flex items-baseline justify-between rounded-xl px-3 py-3 font-serif text-3xl transition-colors",
                        isActivePath(pathname, link.href) ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {link.name}
                      <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
    </header>
  )
}
