import { z } from "zod"

// Form schemas shared by the admin editors (client validation) and their server actions.

export const requiredText = (max = 200) => z.string().trim().min(1, "Required").max(max)
export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
export const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Enter a full URL, starting with https://")])
  .transform((value) => value || null)
export const tagList = (max = 30) => z.array(z.string().trim().min(1).max(100)).max(max)

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export const postSchema = z
  .object({
    title: requiredText(200),
    slug: z.string().trim().max(120).regex(SLUG_PATTERN, "Lowercase letters, numbers and dashes"),
    /** Optional while drafting, required to publish. */
    excerpt: z.string().trim().max(400),
    content_md: z.string().max(200_000),
    tags: tagList(15),
    image_url: optionalUrl,
    is_published: z.boolean(),
    /** ISO timestamp. A published post with a future date is scheduled. */
    publish_date: z.string().datetime({ offset: true }),
    is_featured: z.boolean(),
    seo_title: optionalText(120),
    seo_description: optionalText(320),
  })
  .superRefine((post, ctx) => {
    if (post.is_published && !post.excerpt) {
      ctx.addIssue({ code: "custom", path: ["excerpt"], message: "Add an excerpt before publishing" })
    }
  })

export type PostFormValues = z.input<typeof postSchema>

export const projectSchema = z
  .object({
    title: requiredText(120),
    description: requiredText(400),
    long_description: optionalText(10_000),
    category: optionalText(40),
    tech_stack: tagList(40),
    features: z.array(z.string().trim().min(1).max(300)).max(30),
    stats: z.array(z.object({ key: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(60) })).max(12),
    github_url: optionalUrl,
    live_url: optionalUrl,
    demo_url: optionalUrl,
    image_url: optionalUrl,
    screenshot_urls: z.array(z.string().url()).max(12),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    is_sellable: z.boolean(),
    price_inr: z.union([z.literal(""), z.coerce.number().positive("Must be more than 0").max(1_000_000)]),
    download_file_path: optionalText(500),
    setup_guide_file_path: optionalText(500),
  })
  .superRefine((project, ctx) => {
    if (!project.is_sellable) return
    if (project.price_inr === "") ctx.addIssue({ code: "custom", path: ["price_inr"], message: "Set a price to sell this project" })
    if (!project.download_file_path)
      ctx.addIssue({ code: "custom", path: ["download_file_path"], message: "Upload the ZIP buyers will download" })
  })

export type ProjectFormValues = z.input<typeof projectSchema>

export const profileSchema = z.object({
  name: requiredText(80),
  title: requiredText(120),
  location: requiredText(120),
  email: z.string().trim().email(),
  phone: optionalText(40),
  working_at: optionalText(120),
  bio: requiredText(600),
  about_me: optionalText(1000),
  story: optionalText(10_000),
  philosophy: optionalText(600),
  image: optionalUrl,
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  twitter_url: optionalUrl,
  discord_handle: optionalText(60),
})

export type ProfileFormValues = z.input<typeof profileSchema>
