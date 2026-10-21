export const SITE_URL = "https://thedevpiyush.com"
export const SITE_NAME = "TheDevPiyush"
export const AUTHOR = "Piyush Choudhary"

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Work", href: "/projects" },
  { name: "Writing", href: "/blog" },
  { name: "Contact", href: "/contact" },
] as const

// Small, serializable slice of the portfolio that client chrome (header, ⌘K, footer) needs.
export interface SiteChromeData {
  name: string
  email: string
  social: { github?: string; linkedin?: string; twitter?: string }
  projects: { id: string; title: string }[]
  posts: { title: string; slug: string }[]
}

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString()
}
