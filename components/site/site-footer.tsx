import Link from "next/link"
import { NAV_LINKS, type SiteChromeData } from "@/lib/site"
import { Container } from "./section"
import { BackToTop } from "./back-to-top"

export function SiteFooter({ data }: { data: SiteChromeData | null }) {
  const elsewhere = [
    { name: "GitHub", href: data?.social.github },
    { name: "LinkedIn", href: data?.social.linkedin },
    { name: "X / Twitter", href: data?.social.twitter },
    { name: "Email", href: data?.email ? `mailto:${data.email}` : undefined },
  ].filter((link): link is { name: string; href: string } => Boolean(link.href))

  return (
    <footer className="mt-12 border-t">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="text-3xl tracking-tight">{data?.name ?? "Piyush Choudhary"}</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Full-stack developer building fast, well-crafted products on the web. Press{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> to jump anywhere.
          </p>
        </div>

        <FooterColumn title="Pages">
          {[...NAV_LINKS, { name: "Resume", href: "/resume" }, { name: "Terminal", href: "/terminal" }].map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {link.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Elsewhere">
          {elsewhere.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </a>
            </li>
          ))}
        </FooterColumn>
      </Container>

      <Container className="flex flex-col gap-3 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} TheDevPiyush. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <a href="/rss.xml" className="transition-colors hover:text-foreground">
            RSS
          </a>
          <Link href="/signin?next=/purchases" className="transition-colors hover:text-foreground">
            Account
          </Link>
          <BackToTop />
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  )
}
