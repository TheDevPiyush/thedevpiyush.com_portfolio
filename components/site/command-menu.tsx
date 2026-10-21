"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command } from "cmdk"
import { create } from "zustand"
import {
  ArrowUpRight,
  AtSign,
  Briefcase,
  CornerDownLeft,
  FileText,
  Github,
  Home,
  Laptop,
  Linkedin,
  LogIn,
  Mail,
  Moon,
  Newspaper,
  Package,
  PenLine,
  Search,
  Sun,
  Terminal,
  Twitter,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useUserStore } from "@/lib/useStore"
import type { SiteChromeData } from "@/lib/site"

export const useCommandMenu = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))

export function CommandMenu({ data }: { data: SiteChromeData | null }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useCommandMenu()
  const isSignedIn = useUserStore((state) => Boolean(state.email))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!useCommandMenu.getState().open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setOpen])

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }
  const go = (href: string) => run(() => router.push(href))
  const openExternal = (href: string) => run(() => window.open(href, "_blank", "noopener,noreferrer"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] [&>button]:hidden">
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">Search pages, projects and posts, or run an action.</DialogDescription>
        <Command loop className="flex flex-col">
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <CommandGroup heading="Pages">
              <CommandItem icon={<Home />} onSelect={go("/")}>Home</CommandItem>
              <CommandItem icon={<User />} onSelect={go("/about")}>About</CommandItem>
              <CommandItem icon={<Briefcase />} onSelect={go("/projects")}>Work</CommandItem>
              <CommandItem icon={<Newspaper />} onSelect={go("/blog")}>Writing</CommandItem>
              <CommandItem icon={<Mail />} onSelect={go("/contact")}>Contact</CommandItem>
              <CommandItem icon={<FileText />} onSelect={go("/resume")}>Resume</CommandItem>
              <CommandItem icon={<Terminal />} onSelect={go("/terminal")} keywords={["cli", "shell"]}>
                Open terminal
              </CommandItem>
              {isSignedIn ? (
                <CommandItem icon={<Package />} onSelect={go("/purchases")}>My purchases</CommandItem>
              ) : (
                <CommandItem icon={<LogIn />} onSelect={go("/signin?next=/purchases")} keywords={["login", "account"]}>
                  Sign in
                </CommandItem>
              )}
            </CommandGroup>

            {!!data?.projects.length && (
              <CommandGroup heading="Projects">
                {data.projects.map((project) => (
                  <CommandItem key={project.id} icon={<Briefcase />} onSelect={go(`/projects#project-${project.id}`)}>
                    {project.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!!data?.posts.length && (
              <CommandGroup heading="Writing">
                {data.posts.map((post) => (
                  <CommandItem key={post.slug} icon={<PenLine />} onSelect={go(`/blog/${post.slug}`)}>
                    {post.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Actions">
              {data?.email && (
                <CommandItem
                  icon={<AtSign />}
                  keywords={["email", "mail"]}
                  onSelect={run(async () => {
                    await navigator.clipboard.writeText(data.email)
                    toast.success("Email copied to clipboard")
                  })}
                >
                  Copy email address
                </CommandItem>
              )}
              <CommandItem icon={<FileText />} onSelect={run(() => window.location.assign("/api/resume?download=1"))}>
                Download resume
              </CommandItem>
              <CommandItem icon={<Sun />} onSelect={run(() => setTheme("light"))} keywords={["theme"]}>Light theme</CommandItem>
              <CommandItem icon={<Moon />} onSelect={run(() => setTheme("dark"))} keywords={["theme"]}>Dark theme</CommandItem>
              <CommandItem icon={<Laptop />} onSelect={run(() => setTheme("system"))} keywords={["theme"]}>System theme</CommandItem>
            </CommandGroup>

            {data && (data.social.github || data.social.linkedin || data.social.twitter) && (
              <CommandGroup heading="Elsewhere">
                {data.social.github && (
                  <CommandItem icon={<Github />} external onSelect={openExternal(data.social.github)}>GitHub</CommandItem>
                )}
                {data.social.linkedin && (
                  <CommandItem icon={<Linkedin />} external onSelect={openExternal(data.social.linkedin)}>LinkedIn</CommandItem>
                )}
                {data.social.twitter && (
                  <CommandItem icon={<Twitter />} external onSelect={openExternal(data.social.twitter)}>X (Twitter)</CommandItem>
                )}
              </CommandGroup>
            )}
          </Command.List>
          <div className="flex items-center justify-between border-t px-4 py-2.5 text-[11px] text-muted-foreground">
            <span className="font-mono">thedevpiyush.com</span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3" /> to select
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function CommandGroup({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      {children}
    </Command.Group>
  )
}

export function CommandItem({
  icon,
  children,
  onSelect,
  keywords,
  external,
}: {
  icon: ReactNode
  children: ReactNode
  onSelect: () => void
  keywords?: string[]
  external?: boolean
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="group flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/80 outline-none transition-colors data-[selected=true]:bg-accent data-[selected=true]:text-foreground [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {external && <ArrowUpRight className="opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />}
    </Command.Item>
  )
}
