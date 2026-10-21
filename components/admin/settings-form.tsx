"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminCard } from "./page-header"
import { FormField, SaveBar } from "./form-field"
import { FileUpload } from "./uploads"
import { settingsSchema, type SiteSettings } from "@/lib/settings"
import { runAction } from "@/lib/admin/run-action"
import { saveSettings } from "@/app/admin/_actions/profile"
import { cn } from "@/lib/utils"

export function SettingsForm({ initial, workingAt }: { initial: SiteSettings; workingAt: string }) {
  const router = useRouter()
  const form = useForm<SiteSettings>({ resolver: zodResolver(settingsSchema), defaultValues: initial })
  const { errors, isDirty, isSubmitting } = form.formState
  const availability = form.watch("availability")
  const description = form.watch("seo.description")

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await runAction(saveSettings(values), "Settings saved")
    if (ok !== undefined) {
      form.reset(values)
      router.refresh()
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminCard title="Availability" description="The pill above your name on the home page.">
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <span className="text-sm">Show the availability pill</span>
            <Controller
              control={form.control}
              name="availability.show"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Status">
              <Controller
                control={form.control}
                name="availability.status"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {(["available", "busy"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => field.onChange(status)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize transition-colors",
                          field.value === status ? "border-foreground bg-muted" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", status === "busy" ? "bg-amber-500" : "bg-emerald-500")} />
                        {status === "busy" ? "Busy" : "Available"}
                      </button>
                    ))}
                  </div>
                )}
              />
            </FormField>
            <FormField label="Text" htmlFor="availability-label" error={errors.availability?.label?.message} hint={`Empty uses “${workingAt || "Working at"}” from your profile.`}>
              <Input id="availability-label" placeholder="Open to freelance work" {...form.register("availability.label")} />
            </FormField>
          </div>

          <div className="rounded-xl border border-dashed p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
            {availability.show ? (
              <span className="inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-xs text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", availability.status === "busy" ? "bg-amber-500" : "bg-emerald-500")} />
                {availability.label || workingAt || "—"}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Hidden</span>
            )}
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Resume"
        description="Served at /resume and by “Download resume”."
        actions={
          <a href="/resume" target="_blank" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }
      >
        <FormField label="Resume PDF" error={errors.resume?.url?.message} hint="Without an upload, RESUME_PDF_URL or the Google Doc export is used.">
          <Controller
            control={form.control}
            name="resume.url"
            render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} kind="resume" useUrl />}
          />
        </FormField>
      </AdminCard>

      <AdminCard title="Search & sharing" description="Default description for the home page in Google and link previews.">
        <FormField label="Site description" htmlFor="seo-description" error={errors.seo?.description?.message} counter={[description.length, 160]}>
          <Textarea id="seo-description" rows={3} {...form.register("seo.description")} />
        </FormField>
      </AdminCard>

      <SaveBar dirty={isDirty} saving={isSubmitting} onReset={() => form.reset()} />
    </form>
  )
}
