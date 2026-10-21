"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminCard } from "./page-header"
import { FormField } from "./form-field"
import { TagInput } from "./tag-input"
import { FileUpload, GalleryUpload, ImageUpload } from "./uploads"
import { KeyValueEditor, ListEditor } from "./list-editors"
import { confirm } from "./confirm-dialog"
import { projectSchema, type ProjectFormValues } from "@/lib/admin/schemas"
import { runAction } from "@/lib/admin/run-action"
import { deleteProject, saveProject } from "@/app/admin/_actions/projects"

export interface ProjectEditorProps {
  id: string
  isNew: boolean
  initial: ProjectFormValues
  categories: string[]
  purchases: number
}

export function ProjectEditor({ id, isNew: initiallyNew, initial, categories, purchases }: ProjectEditorProps) {
  const router = useRouter()
  const [isNew, setIsNew] = useState(initiallyNew)
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema, undefined, { raw: true }), defaultValues: initial })
  const { errors, isDirty, isSubmitting } = form.formState
  const isSellable = useWatch({ control: form.control, name: "is_sellable" })
  const isActive = useWatch({ control: form.control, name: "is_active" })

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [form])

  const onSubmit = form.handleSubmit(
    async (values) => {
      // Empty rows in the list editors aren't worth an error.
      const cleaned = {
        ...values,
        features: values.features.map((feature) => feature.trim()).filter(Boolean),
        stats: values.stats.filter((stat) => stat.key.trim() && stat.value.trim()),
      }
      const saved = await runAction(saveProject(id, cleaned), isNew ? "Project created" : "Project saved")
      if (!saved) return
      form.reset(cleaned)
      if (isNew) {
        setIsNew(false)
        window.history.replaceState(null, "", `/admin/projects/${id}`)
      }
      router.refresh()
    },
    () => document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }),
  )

  const remove = async () => {
    if (!(await confirm({ title: "Delete this project?", description: "Its images and files are deleted too.", confirmLabel: "Delete", destructive: true })))
      return
    const ok = await runAction(deleteProject(id), "Project deleted")
    if (ok !== undefined) {
      form.reset(form.getValues())
      router.push("/admin/projects")
      router.refresh()
    }
  }

  const text = (name: "title" | "description" | "long_description" | "category" | "github_url" | "live_url" | "demo_url") => ({
    id: name,
    ...form.register(name),
  })

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-6xl">
      <div className="sticky top-14 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Projects
        </Link>
        <span className="truncate font-medium">{form.watch("title") || "New project"}</span>
        {isDirty && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        <div className="ml-auto flex items-center gap-2">
          {!isNew && isActive && (
            <Button asChild variant="ghost" size="pill-sm">
              <a href={`/projects#project-${id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View
              </a>
            </Button>
          )}
          <Button type="submit" variant="brand" size="pill-sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isNew ? "Create project" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <AdminCard title="Details">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
                <FormField label="Title" htmlFor="title" error={errors.title?.message}>
                  <Input {...text("title")} />
                </FormField>
                <FormField label="Category" htmlFor="category" hint="Used by the filter on /projects.">
                  <Input {...text("category")} list="project-categories" placeholder="Web app" />
                  <datalist id="project-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </FormField>
              </div>
              <FormField label="Short description" htmlFor="description" error={errors.description?.message} hint="One or two sentences for the project list.">
                <Textarea rows={2} {...text("description")} />
              </FormField>
              <FormField label="Long description" htmlFor="long_description" error={errors.long_description?.message}>
                <Textarea rows={6} {...text("long_description")} />
              </FormField>
              <FormField label="Tech stack">
                <Controller
                  control={form.control}
                  name="tech_stack"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="Add a technology" />}
                />
              </FormField>
              <FormField label="Features" error={errors.features?.message}>
                <Controller
                  control={form.control}
                  name="features"
                  render={({ field }) => <ListEditor value={field.value} onChange={field.onChange} placeholder="What it does" addLabel="Add feature" />}
                />
              </FormField>
              <FormField label="Stats" hint="Optional numbers shown on the project, e.g. Users · 2k+.">
                <Controller
                  control={form.control}
                  name="stats"
                  render={({ field }) => <KeyValueEditor value={field.value} onChange={field.onChange} />}
                />
              </FormField>
            </div>
          </AdminCard>

          <AdminCard title="Screenshots" description="Shown in the buy preview. Drag to reorder.">
            <Controller
              control={form.control}
              name="screenshot_urls"
              render={({ field }) => <GalleryUpload value={field.value} onChange={field.onChange} kind="project-image" scope={id} />}
            />
          </AdminCard>

          <AdminCard title="Links">
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField label="Source code" htmlFor="github_url" error={errors.github_url?.message}>
                <Input type="url" placeholder="https://github.com/…" {...text("github_url")} />
              </FormField>
              <FormField label="Live site" htmlFor="live_url" error={errors.live_url?.message}>
                <Input type="url" placeholder="https://" {...text("live_url")} />
              </FormField>
              <FormField label="Demo video" htmlFor="demo_url" error={errors.demo_url?.message}>
                <Input type="url" placeholder="https://" {...text("demo_url")} />
              </FormField>
            </div>
          </AdminCard>
        </div>

        <aside className="space-y-6">
          <AdminCard title="Visibility">
            <div className="space-y-4 text-sm">
              <label className="flex items-center justify-between gap-3">
                Show on the site
                <Controller control={form.control} name="is_active" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              </label>
              <label className="flex items-center justify-between gap-3">
                Featured on the home page
                <Controller control={form.control} name="is_featured" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Cover image">
            <Controller
              control={form.control}
              name="image_url"
              render={({ field }) => <ImageUpload value={field.value ?? ""} onChange={field.onChange} kind="project-image" scope={id} />}
            />
          </AdminCard>

          <AdminCard title="Selling" description={purchases ? `${purchases} paid purchase${purchases === 1 ? "" : "s"} so far.` : "Sell the source code through Razorpay."}>
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 text-sm">
                Sell this project
                <Controller control={form.control} name="is_sellable" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              </label>
              {isSellable && (
                <>
                  <FormField label="Price (₹)" htmlFor="price_inr" error={errors.price_inr?.message}>
                    <Input id="price_inr" type="number" min={1} step={1} inputMode="numeric" {...form.register("price_inr")} />
                  </FormField>
                  <FormField label="Project ZIP" error={errors.download_file_path?.message} hint="Private. Buyers get a short-lived download link.">
                    <Controller
                      control={form.control}
                      name="download_file_path"
                      render={({ field }) => <FileUpload value={field.value ?? ""} onChange={field.onChange} kind="project-zip" scope={id} />}
                    />
                  </FormField>
                  <FormField label="Setup guide" hint="Markdown, shown before purchase.">
                    <Controller
                      control={form.control}
                      name="setup_guide_file_path"
                      render={({ field }) => <FileUpload value={field.value ?? ""} onChange={field.onChange} kind="setup-guide" scope={id} />}
                    />
                  </FormField>
                </>
              )}
            </div>
          </AdminCard>

          {!isNew && (
            <Button type="button" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={remove}>
              <Trash2 /> Delete project
            </Button>
          )}
        </aside>
      </div>
    </form>
  )
}
