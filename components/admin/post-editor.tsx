"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, CalendarClock, Columns2, Eye, History, Loader2, PenLine, RefreshCw, Trash2, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminCard } from "./page-header"
import { FormField } from "./form-field"
import { StatusBadge } from "./status-badge"
import { TagInput } from "./tag-input"
import { ImageUpload } from "./uploads"
import { MarkdownPreview } from "./markdown-preview"
import { confirm } from "./confirm-dialog"
import { postSchema, slugify, type PostFormValues } from "@/lib/admin/schemas"
import { postStatus, STATUS_STYLES } from "@/lib/admin/post-status"
import { runAction } from "@/lib/admin/run-action"
import { deletePost, savePost } from "@/app/admin/_actions/posts"
import { countWords } from "@/lib/blog/post"
import { SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

// CodeMirror is browser-only and only needed here.
const MarkdownEditor = dynamic(() => import("./markdown-editor").then((mod) => mod.MarkdownEditor), {
  ssr: false,
  loading: () => <div className="grid flex-1 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>,
})

type ViewMode = "write" | "split" | "preview"

export interface PostEditorProps {
  id: string | null
  initial: PostFormValues
  updatedAt: string | null
  /** Body from the old HTML editor, converted to Markdown on open. */
  legacyHtml: string | null
  tagSuggestions: string[]
}

const AUTOSAVE_MS = 3000

function toLocalInput(iso: string) {
  const date = new Date(iso)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function relativeTime(date: Date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  return minutes < 60 ? `${minutes} min ago` : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function PostEditor({ id: initialId, initial, updatedAt, legacyHtml, tagSuggestions }: PostEditorProps) {
  const router = useRouter()
  const [postId, setPostId] = useState(initialId)
  // What the server currently has; drives the status badge, autosave and button labels.
  const [saved, setSaved] = useState({ is_published: initial.is_published, publish_date: initial.publish_date, slug: initial.slug })
  const [lastSaved, setLastSaved] = useState<Date | null>(updatedAt ? new Date(updatedAt) : null)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<ViewMode>("write")
  const [slugTouched, setSlugTouched] = useState(Boolean(initialId))
  const [backup, setBackup] = useState<{ values: PostFormValues; savedAt: number } | null>(null)
  const [converted, setConverted] = useState(false)
  const [, forceTick] = useState(0)

  const form = useForm<PostFormValues>({ resolver: zodResolver(postSchema, undefined, { raw: true }), defaultValues: initial })
  const { errors, isDirty } = form.formState
  const values = useWatch({ control: form.control }) as PostFormValues
  const backupKey = `post-draft:${postId ?? "new"}`

  const words = countWords(values.content_md ?? "")
  const savedStatus = postStatus({ is_published: saved.is_published, publish_date: saved.publish_date })
  const wasPublished = Boolean(initialId) && initial.is_published

  // ---------- Saving ----------

  const save = useCallback(
    async ({ silent = false, overrides }: { silent?: boolean; overrides?: Partial<PostFormValues> } = {}) => {
      for (const [key, value] of Object.entries(overrides ?? {})) {
        form.setValue(key as keyof PostFormValues, value as never, { shouldDirty: true })
      }
      if (!(await form.trigger())) {
        if (!silent) toast.error("Fix the highlighted fields first")
        return false
      }

      const current = form.getValues()
      setSaving(true)
      const result = silent ? await savePost(postId, current) : undefined
      const data = silent ? (result?.ok ? result.data : undefined) : await runAction(savePost(postId, current))
      setSaving(false)
      if (!data) return false

      form.reset(current, { keepDefaultValues: false })
      setSaved({ is_published: current.is_published, publish_date: current.publish_date, slug: data.slug })
      setLastSaved(new Date(data.updatedAt))
      try {
        localStorage.removeItem(backupKey)
      } catch {}

      if (!postId) {
        setPostId(data.id)
        // Swap the URL without remounting the editor.
        window.history.replaceState(null, "", `/admin/posts/${data.id}`)
      }
      if (!silent) {
        const status = postStatus(current)
        toast.success(status === "draft" ? "Draft saved" : status === "scheduled" ? "Post scheduled" : "Post is live")
      }
      return true
    },
    [backupKey, form, postId],
  )

  const publish = () => {
    const isFuture = new Date(form.getValues("publish_date")).getTime() > Date.now()
    // Publishing an old draft dates it today unless it was deliberately scheduled.
    return save({ overrides: { is_published: true, ...(isFuture || wasPublished ? {} : { publish_date: new Date().toISOString() }) } })
  }

  // Autosave drafts that already exist. Published posts only save when you click Update.
  useEffect(() => {
    if (!isDirty || !postId || saved.is_published || values.is_published) return
    const timer = setTimeout(() => void save({ silent: true }), AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [values, isDirty, postId, saved.is_published, save])

  // Local backup of unsaved edits, so a closed tab never loses work.
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(backupKey, JSON.stringify({ values: form.getValues(), savedAt: Date.now() }))
      } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [values, isDirty, backupKey, form])

  // Offer to restore a backup newer than the saved post.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(backupKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { values: PostFormValues; savedAt: number }
      const newer = !updatedAt || parsed.savedAt > new Date(updatedAt).getTime()
      if (newer && JSON.stringify(parsed.values) !== JSON.stringify(initial)) setBackup(parsed)
      else localStorage.removeItem(backupKey)
    } catch {}
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Posts written in the old HTML editor are converted to Markdown when opened.
  useEffect(() => {
    if (!legacyHtml || initial.content_md) return
    void Promise.all([import("turndown"), import("turndown-plugin-gfm")]).then(([{ default: Turndown }, { gfm }]) => {
      const service = new Turndown({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-", emDelimiter: "_" })
      service.use(gfm)
      const markdown = service
        .turndown(legacyHtml.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, ""))
        .replace(/^(#{1,6} \d+)\\\./gm, "$1.")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
      form.setValue("content_md", markdown, { shouldDirty: true })
      setConverted(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ⌘S saves; warn before leaving with unsaved changes; refresh "saved x ago".
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        void save()
      }
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault()
    }
    const tick = setInterval(() => forceTick((value) => value + 1), 15_000)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      clearInterval(tick)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [save, form])

  // Slug follows the title until edited by hand.
  const onTitleChange = (title: string) => {
    if (!slugTouched) form.setValue("slug", slugify(title), { shouldDirty: true, shouldValidate: Boolean(errors.slug) })
  }

  const remove = async () => {
    if (!postId) return
    if (!(await confirm({ title: "Delete this post?", description: "This can't be undone.", confirmLabel: "Delete", destructive: true }))) return
    const ok = await runAction(deletePost(postId), "Post deleted")
    if (ok !== undefined) {
      try {
        localStorage.removeItem(backupKey)
      } catch {}
      form.reset(form.getValues())
      router.push("/admin/posts")
      router.refresh()
    }
  }

  // ---------- Derived UI ----------

  const isScheduledDate = new Date(values.publish_date).getTime() > Date.now()
  const primaryLabel = !values.is_published
    ? isScheduledDate
      ? "Schedule"
      : "Publish"
    : saved.is_published
      ? "Update"
      : isScheduledDate
        ? "Schedule"
        : "Publish"

  const saveState = saving
    ? "Saving…"
    : isDirty
      ? "Unsaved changes"
      : lastSaved
        ? `Saved ${relativeTime(lastSaved)}`
        : "Not saved yet"

  const seoTitle = values.seo_title || values.title || "Post title"
  const seoDescription = values.seo_description || values.excerpt || "The excerpt is used when no description is set."

  return (
    <form onSubmit={(event) => event.preventDefault()} className="mx-auto max-w-[90rem]">
      {/* Top bar */}
      <div className="sticky top-14 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Posts
        </Link>
        <StatusBadge className={STATUS_STYLES[postId ? savedStatus : "draft"]}>{postId ? savedStatus : "new"}</StatusBadge>
        <span className={cn("text-xs text-muted-foreground", isDirty && !saving && "text-amber-600 dark:text-amber-400")}>{saveState}</span>

        <div className="ml-auto flex items-center gap-2">
          {postId && (
            <Button asChild variant="ghost" size="pill-sm">
              <a href={savedStatus === "published" ? `/blog/${saved.slug}` : `/admin/posts/${postId}/preview`} target="_blank" rel="noopener noreferrer">
                <Eye /> {savedStatus === "published" ? "View" : "Preview"}
              </a>
            </Button>
          )}
          {!values.is_published && (
            <Button type="button" variant="outline" size="pill-sm" onClick={() => save()} disabled={saving}>
              Save draft
            </Button>
          )}
          <Button type="button" variant="brand" size="pill-sm" onClick={values.is_published ? () => save() : publish} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {primaryLabel}
          </Button>
        </div>
      </div>

      {backup && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm">
          <History className="h-4 w-4 shrink-0" />
          <span className="flex-1">You have unsaved changes from {new Date(backup.savedAt).toLocaleString()}.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-full"
            onClick={() => {
              form.reset(initial)
              for (const [key, value] of Object.entries(backup.values)) {
                form.setValue(key as keyof PostFormValues, value as never, { shouldDirty: true })
              }
              setBackup(null)
            }}
          >
            Restore
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full"
            onClick={() => {
              localStorage.removeItem(backupKey)
              setBackup(null)
            }}
          >
            Discard
          </Button>
        </div>
      )}

      {converted && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <Wand2 className="h-4 w-4 shrink-0" />
          This post was written in the old editor and has been converted to Markdown. Check it over, then save.
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Writing column */}
        <div className="min-w-0 space-y-4">
          <div className="space-y-1">
            <textarea
              {...form.register("title", { onChange: (event) => onTitleChange(event.target.value) })}
              placeholder="Post title"
              rows={1}
              aria-label="Title"
              className="[field-sizing:content] w-full resize-none bg-transparent font-serif text-4xl leading-tight tracking-tight outline-none placeholder:text-muted-foreground/50 sm:text-5xl"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1">
            <textarea
              {...form.register("excerpt")}
              placeholder="A one or two sentence summary, shown in lists and link previews…"
              rows={2}
              aria-label="Excerpt"
              className="[field-sizing:content] w-full resize-none bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/50"
            />
            {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt.message}</p>}
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
              <div className="inline-flex rounded-full border p-0.5 text-xs" role="tablist" aria-label="Editor view">
                {(
                  [
                    { value: "write", label: "Write", icon: PenLine },
                    { value: "split", label: "Split", icon: Columns2 },
                    { value: "preview", label: "Preview", icon: Eye },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={mode === option.value}
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors",
                      option.value === "split" && "hidden lg:inline-flex",
                      mode === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <option.icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {words.toLocaleString("en-US")} words · {Math.max(1, Math.round(words / 220))} min read
              </span>
            </div>

            <div className={cn("grid h-[70vh] min-h-[28rem]", mode === "split" && "lg:grid-cols-2 lg:divide-x")}>
              {mode !== "preview" && (
                <Controller
                  control={form.control}
                  name="content_md"
                  render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} className="h-full" />}
                />
              )}
              {mode !== "write" && (
                <div className={cn("overflow-y-auto px-6 py-6 sm:px-10", mode === "split" && "hidden lg:block")}>
                  <MarkdownPreview markdown={values.content_md ?? ""} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings column */}
        <aside className="space-y-4">
          <AdminCard title="Publishing">
            <div className="space-y-4">
              <Controller
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-1 rounded-full border p-0.5 text-sm">
                    {[
                      { value: false, label: "Draft" },
                      { value: true, label: "Published" },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "rounded-full px-3 py-1.5 transition-colors",
                          field.value === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              />
              <FormField label="Publish date" htmlFor="publish_date" error={errors.publish_date?.message}>
                <Controller
                  control={form.control}
                  name="publish_date"
                  render={({ field }) => (
                    <Input
                      id="publish_date"
                      type="datetime-local"
                      value={toLocalInput(field.value)}
                      onChange={(event) => event.target.value && field.onChange(new Date(event.target.value).toISOString())}
                    />
                  )}
                />
              </FormField>
              {values.is_published && isScheduledDate && (
                <p className="flex items-start gap-2 text-xs text-sky-700 dark:text-sky-400">
                  <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Goes live automatically on {new Date(values.publish_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.
                </p>
              )}
              <label className="flex items-center justify-between gap-3 text-sm">
                Feature on the blog page
                <Controller
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="URL">
            <FormField
              label="Slug"
              htmlFor="slug"
              error={errors.slug?.message}
              hint={
                wasPublished && values.slug !== initial.slug
                  ? "Changing the slug of a live post breaks existing links to it."
                  : `${SITE_URL.replace("https://", "")}/blog/${values.slug || "…"}`
              }
            >
              <div className="flex gap-2">
                <Input id="slug" {...form.register("slug", { onChange: () => setSlugTouched(true) })} className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    form.setValue("slug", slugify(form.getValues("title")), { shouldDirty: true, shouldValidate: true })
                    setSlugTouched(false)
                  }}
                  aria-label="Generate from title"
                  title="Generate from title"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </FormField>
          </AdminCard>

          <AdminCard title="Tags">
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} suggestions={tagSuggestions} placeholder="Add a tag" />}
            />
          </AdminCard>

          <AdminCard title="Cover image" description="Optional. Link previews use a generated card either way.">
            <Controller
              control={form.control}
              name="image_url"
              render={({ field }) => <ImageUpload value={field.value ?? ""} onChange={field.onChange} kind="post-image" />}
            />
          </AdminCard>

          <AdminCard title="Search & sharing">
            <div className="space-y-4">
              <FormField label="SEO title" htmlFor="seo_title" counter={[(values.seo_title ?? "").length, 60]} error={errors.seo_title?.message}>
                <Input id="seo_title" placeholder={values.title || "Defaults to the title"} {...form.register("seo_title")} />
              </FormField>
              <FormField
                label="Meta description"
                htmlFor="seo_description"
                counter={[(values.seo_description ?? "").length, 160]}
                error={errors.seo_description?.message}
              >
                <Textarea id="seo_description" rows={3} placeholder={values.excerpt || "Defaults to the excerpt"} {...form.register("seo_description")} />
              </FormField>
              <div className="space-y-1 rounded-xl border bg-background p-3">
                <p className="truncate text-xs text-muted-foreground">
                  thedevpiyush.com › blog › {values.slug || "…"}
                </p>
                <p className="line-clamp-1 text-[15px] text-[#1a0dab] dark:text-[#8ab4f8]">{seoTitle} | TheDevPiyush</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{seoDescription}</p>
              </div>
            </div>
          </AdminCard>

          {postId && (
            <Button type="button" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={remove}>
              <Trash2 /> Delete post
            </Button>
          )}
        </aside>
      </div>
    </form>
  )
}
