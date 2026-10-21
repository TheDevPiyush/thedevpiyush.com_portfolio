"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminCard } from "./page-header"
import { FormField, SaveBar } from "./form-field"
import { ImageUpload } from "./uploads"
import { profileSchema, type ProfileFormValues } from "@/lib/admin/schemas"
import { runAction } from "@/lib/admin/run-action"
import { saveProfile } from "@/app/admin/_actions/profile"

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const router = useRouter()
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema, undefined, { raw: true }), defaultValues: initial })
  const { errors, isDirty, isSubmitting } = form.formState
  const text = (name: keyof ProfileFormValues) => ({ id: name, ...form.register(name) })
  const error = (name: keyof ProfileFormValues) => errors[name]?.message

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await runAction(saveProfile(values), "Profile saved")
    if (ok !== undefined) {
      form.reset(values)
      router.refresh()
    }
  })

  const story = form.watch("story") ?? ""

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminCard title="Basics" description="Shown in the hero, the header and across the site.">
        <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
          <FormField label="Photo" hint="Square works best.">
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <ImageUpload value={field.value ?? ""} onChange={field.onChange} kind="avatar" aspect="aspect-[4/5]" />
              )}
            />
          </FormField>
          <div className="grid content-start gap-5 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" error={error("name")}>
              <Input {...text("name")} />
            </FormField>
            <FormField label="Title" htmlFor="title" error={error("title")}>
              <Input {...text("title")} placeholder="Full-stack developer" />
            </FormField>
            <FormField label="Location" htmlFor="location" error={error("location")}>
              <Input {...text("location")} />
            </FormField>
            <FormField label="Working at" htmlFor="working_at" error={error("working_at")} hint="Also the default hero availability text.">
              <Input {...text("working_at")} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={error("email")}>
              <Input type="email" {...text("email")} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={error("phone")} hint="Optional.">
              <Input {...text("phone")} />
            </FormField>
            <FormField label="Short bio" htmlFor="bio" error={error("bio")} hint="The sentence under your name on the home page." className="sm:col-span-2">
              <Textarea rows={3} {...text("bio")} />
            </FormField>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="About page">
        <div className="space-y-5">
          <FormField label="Intro" htmlFor="about_me" error={error("about_me")} hint="The large paragraph at the top of /about.">
            <Textarea rows={3} {...text("about_me")} />
          </FormField>
          <FormField
            label="My story"
            htmlFor="story"
            error={error("story")}
            hint={`Separate paragraphs with a blank line · ${story.split(/\n\s*\n/).filter((p) => p.trim()).length} paragraph(s)`}
          >
            <Textarea rows={10} {...text("story")} />
          </FormField>
          <FormField label="Philosophy" htmlFor="philosophy" error={error("philosophy")} hint="Shown as a pull quote.">
            <Textarea rows={2} {...text("philosophy")} />
          </FormField>
        </div>
      </AdminCard>

      <AdminCard title="Elsewhere" description="Leave empty to hide a link.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="GitHub" htmlFor="github_url" error={error("github_url")}>
            <Input type="url" placeholder="https://github.com/…" {...text("github_url")} />
          </FormField>
          <FormField label="LinkedIn" htmlFor="linkedin_url" error={error("linkedin_url")}>
            <Input type="url" placeholder="https://linkedin.com/in/…" {...text("linkedin_url")} />
          </FormField>
          <FormField label="X / Twitter" htmlFor="twitter_url" error={error("twitter_url")}>
            <Input type="url" placeholder="https://x.com/…" {...text("twitter_url")} />
          </FormField>
          <FormField label="Discord" htmlFor="discord_handle" error={error("discord_handle")}>
            <Input placeholder="username" {...text("discord_handle")} />
          </FormField>
        </div>
      </AdminCard>

      <SaveBar dirty={isDirty} saving={isSubmitting} onReset={() => form.reset()} />
    </form>
  )
}
