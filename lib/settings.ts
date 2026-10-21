import { z } from "zod"

// Site-wide settings stored in site_settings (one row per key, value is JSON). Edited in /admin/settings.

export const settingsSchema = z.object({
  availability: z.object({
    show: z.boolean(),
    status: z.enum(["available", "busy"]),
    /** Empty means "use the Working at field from the profile". */
    label: z.string().trim().max(80),
  }),
  resume: z.object({
    /** Direct link to a PDF. Empty falls back to RESUME_PDF_URL, then the Google Doc export. */
    url: z.union([z.literal(""), z.string().trim().url()]),
  }),
  seo: z.object({
    description: z.string().trim().max(300),
  }),
})

export type SiteSettings = z.infer<typeof settingsSchema>
export type SettingsKey = keyof SiteSettings

export const DEFAULT_SETTINGS: SiteSettings = {
  availability: { show: true, status: "available", label: "" },
  resume: { url: "" },
  seo: {
    description:
      "Portfolio of Piyush Choudhary, a full-stack developer. Explore my projects, writing and technical work in modern web development.",
  },
}

// Fills in anything missing or malformed with defaults, key by key.
export function resolveSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const settings = structuredClone(DEFAULT_SETTINGS) as Record<string, unknown>
  for (const row of rows) {
    const shape = settingsSchema.shape[row.key as SettingsKey]
    if (!shape) continue
    const merged = { ...(settings[row.key] as object), ...(row.value as object) }
    const parsed = shape.safeParse(merged)
    if (parsed.success) settings[row.key] = parsed.data
  }
  return settings as SiteSettings
}
