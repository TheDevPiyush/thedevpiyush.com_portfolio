"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, ArrowLeft, Inbox as InboxIcon, Mail, MailOpen, Reply, Search, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterTabs } from "./data-table"
import { confirm } from "./confirm-dialog"
import { runAction } from "@/lib/admin/run-action"
import { deleteMessages, setMessageStatus } from "@/app/admin/_actions/business"
import type { ContactMessage } from "@/lib/admin/queries"
import { cn } from "@/lib/utils"

type Folder = "inbox" | "unread" | "archived" | "spam"
type Status = ContactMessage["status"]

const inFolder = (message: ContactMessage, folder: Folder) =>
  folder === "inbox" ? message.status === "unread" || message.status === "read" : folder === message.status

function when(iso: string) {
  const date = new Date(iso)
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })
}

export function InboxView({ messages: initial, initialId }: { messages: ContactMessage[]; initialId?: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initial)
  const [folder, setFolder] = useState<Folder>(() => {
    const target = initial.find((message) => message.id === initialId)
    return target && (target.status === "archived" || target.status === "spam") ? target.status : "inbox"
  })
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? null)
  const [query, setQuery] = useState("")
  useEffect(() => setMessages(initial), [initial])

  const visible = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return messages.filter(
      (message) =>
        inFolder(message, folder) &&
        terms.every((term) => `${message.name} ${message.email} ${message.subject ?? ""} ${message.message}`.toLowerCase().includes(term)),
    )
  }, [messages, folder, query])

  const selected = messages.find((message) => message.id === selectedId) ?? null
  const count = (target: Folder) => messages.filter((message) => inFolder(message, target)).length

  const updateStatus = async (ids: string[], status: Status, success?: string) => {
    setMessages((current) => current.map((message) => (ids.includes(message.id) ? { ...message, status } : message)))
    const ok = await runAction(setMessageStatus(ids, status), success)
    router.refresh()
    return ok !== undefined
  }

  const open = (message: ContactMessage) => {
    setSelectedId(message.id)
    if (message.status === "unread") void updateStatus([message.id], "read")
  }

  const remove = async (message: ContactMessage) => {
    if (!(await confirm({ title: "Delete this message?", description: "It can't be recovered.", confirmLabel: "Delete", destructive: true }))) return
    setMessages((current) => current.filter((item) => item.id !== message.id))
    setSelectedId(null)
    await runAction(deleteMessages([message.id]), "Message deleted")
    router.refresh()
  }

  const markAllRead = () => {
    const unread = messages.filter((message) => message.status === "unread").map((message) => message.id)
    if (unread.length) void updateStatus(unread, "read", "All caught up")
  }

  const replyHref = (message: ContactMessage) => {
    const subject = `Re: ${message.subject || "Your message on thedevpiyush.com"}`
    const quoted = message.message
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")
    return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`\n\n${message.name} wrote:\n${quoted}`)}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          value={folder}
          onChange={(value) => {
            setFolder(value)
            setSelectedId(null)
          }}
          options={[
            { value: "inbox", label: "Inbox", count: count("inbox") },
            { value: "unread", label: "Unread", count: count("unread") },
            { value: "archived", label: "Archived", count: count("archived") },
            { value: "spam", label: "Spam", count: count("spam") },
          ]}
        />
        <div className="flex items-center gap-2">
          <label className="relative block w-full lg:w-64">
            <span className="sr-only">Search messages</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" className="h-9 rounded-full pl-9" />
          </label>
          {count("unread") > 0 && (
            <Button variant="outline" size="pill-sm" onClick={markAllRead}>
              <MailOpen /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-h-[32rem] overflow-hidden rounded-2xl border lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* List */}
        <ul className={cn("max-h-[70vh] divide-y overflow-y-auto lg:border-r", selected && "hidden lg:block")}>
          {visible.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-6 py-20 text-center text-sm text-muted-foreground">
              <InboxIcon className="h-6 w-6" />
              {query ? "No matches." : folder === "inbox" ? "No messages yet. They'll appear here when someone uses the contact form." : `Nothing in ${folder}.`}
            </li>
          )}
          {visible.map((message) => (
            <li key={message.id}>
              <button
                type="button"
                onClick={() => open(message)}
                className={cn(
                  "block w-full space-y-1 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  selectedId === message.id && "bg-muted",
                )}
              >
                <span className="flex items-center gap-2">
                  {message.status === "unread" && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                  <span className={cn("min-w-0 flex-1 truncate text-sm", message.status === "unread" && "font-semibold")}>{message.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{when(message.created_at)}</span>
                </span>
                <span className="block truncate text-sm">{message.subject || "(no subject)"}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{message.message}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        <div className={cn("min-w-0", !selected && "hidden lg:block")}>
          {selected ? (
            <article className="flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedId(null)}>
                  <ArrowLeft /> Back
                </Button>
                <Button asChild variant="brand" size="sm" className="rounded-full">
                  <a href={replyHref(selected)}>
                    <Reply /> Reply
                  </a>
                </Button>
                <div className="ml-auto flex items-center gap-1">
                  <IconAction
                    label={selected.status === "unread" ? "Mark as read" : "Mark as unread"}
                    onClick={() => updateStatus([selected.id], selected.status === "unread" ? "read" : "unread")}
                  >
                    {selected.status === "unread" ? <MailOpen /> : <Mail />}
                  </IconAction>
                  {selected.status === "archived" || selected.status === "spam" ? (
                    <IconAction label="Move to inbox" onClick={() => updateStatus([selected.id], "read", "Moved to inbox")}>
                      <InboxIcon />
                    </IconAction>
                  ) : (
                    <>
                      <IconAction label="Archive" onClick={() => updateStatus([selected.id], "archived", "Archived")}>
                        <Archive />
                      </IconAction>
                      <IconAction label="Mark as spam" onClick={() => updateStatus([selected.id], "spam", "Marked as spam")}>
                        <ShieldAlert />
                      </IconAction>
                    </>
                  )}
                  <IconAction label="Delete" onClick={() => remove(selected)} destructive>
                    <Trash2 />
                  </IconAction>
                </div>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <header className="space-y-3">
                  <h2 className="font-serif text-3xl tracking-tight">{selected.subject || "(no subject)"}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-medium">{selected.name}</span>
                    <a href={`mailto:${selected.email}`} className="text-muted-foreground hover:text-foreground">
                      {selected.email}
                    </a>
                    <span className="text-muted-foreground">· {new Date(selected.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </header>
                <p className="whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
            </article>
          ) : (
            <div className="grid h-full place-items-center p-10 text-sm text-muted-foreground">Select a message to read it.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function IconAction({ label, onClick, destructive, children }: { label: string; onClick: () => void; destructive?: boolean; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 [&_svg]:h-4 [&_svg]:w-4", destructive && "text-destructive hover:text-destructive")}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}
