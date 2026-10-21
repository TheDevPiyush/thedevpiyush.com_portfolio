"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command } from "cmdk"
import { create } from "zustand"
import { CornerDownLeft, ExternalLink, FolderKanban, Inbox, Loader2, Moon, PenLine, Plus, Search, Sun } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { CommandGroup, CommandItem } from "@/components/site/command-menu"
import { ADMIN_NAV_ITEMS } from "@/lib/admin/nav"
import { getCommandRecords, type CommandRecord } from "@/app/admin/_actions/search"

export const useAdminCommand = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))

const RECORD_ICONS = { post: PenLine, project: FolderKanban, message: Inbox }

export function AdminCommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useAdminCommand()
  const [records, setRecords] = useState<CommandRecord[] | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!useAdminCommand.getState().open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setOpen])

  // Refresh the record list each time the menu opens so new posts show up.
  useEffect(() => {
    if (!open) return
    getCommandRecords().then((result) => result.ok && setRecords(result.data))
  }, [open])

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }
  const go = (href: string) => run(() => router.push(href))

  const groups = [
    { heading: "Posts", kind: "post" },
    { heading: "Projects", kind: "project" },
    { heading: "Messages", kind: "message" },
  ] as const

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] [&>button]:hidden">
        <DialogTitle className="sr-only">Admin command menu</DialogTitle>
        <DialogDescription className="sr-only">Jump to a section or record, or create something new.</DialogDescription>
        <Command loop className="flex flex-col">
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search sections, posts, projects…"
              className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {records === null && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <CommandGroup heading="Create">
              <CommandItem icon={<Plus />} onSelect={go("/admin/posts/new")} keywords={["write", "blog"]}>
                New post
              </CommandItem>
              <CommandItem icon={<Plus />} onSelect={go("/admin/projects/new")}>New project</CommandItem>
            </CommandGroup>

            <CommandGroup heading="Go to">
              {ADMIN_NAV_ITEMS.map((item) => (
                <CommandItem key={item.href} icon={<item.icon />} onSelect={go(item.href)} keywords={item.keywords?.split(" ")}>
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>

            {groups.map(({ heading, kind }) => {
              const items = records?.filter((record) => record.kind === kind) ?? []
              if (!items.length) return null
              const Icon = RECORD_ICONS[kind]
              return (
                <CommandGroup key={kind} heading={heading}>
                  {items.map((record) => (
                    <CommandItem key={record.id} icon={<Icon />} onSelect={go(record.href)}>
                      {record.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}

            <CommandGroup heading="Actions">
              <CommandItem icon={<ExternalLink />} onSelect={run(() => window.open("/", "_blank", "noopener"))}>
                View site
              </CommandItem>
              <CommandItem icon={<Sun />} onSelect={run(() => setTheme("light"))} keywords={["theme"]}>Light theme</CommandItem>
              <CommandItem icon={<Moon />} onSelect={run(() => setTheme("dark"))} keywords={["theme"]}>Dark theme</CommandItem>
            </CommandGroup>
          </Command.List>
          <div className="flex items-center justify-between border-t px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>admin</span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="h-3 w-3" /> to select
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
