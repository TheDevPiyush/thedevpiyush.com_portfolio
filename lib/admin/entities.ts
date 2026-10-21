import { z } from "zod"
import { CACHE_TAGS, type CacheTag } from "@/lib/data/cache-tags"

// The simple profile sections, described once and used by both the admin UI (form fields, list rows)
// and the server actions (validation, table, cache tag).

export type FieldType = "text" | "textarea" | "date" | "number" | "switch" | "tags" | "lines" | "url"

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  /** Shares a row with the next half-width field on wide screens. */
  half?: boolean
  /** Offer values already used in this column (e.g. skill categories). */
  suggest?: boolean
}

type Row = Record<string, unknown>

export interface EntityConfig {
  table: string
  tag: CacheTag
  title: string
  singular: string
  description: string
  /** Drag to reorder (writes display_order). */
  sortable: boolean
  orderBy?: string
  fields: FieldConfig[]
  schema: z.ZodTypeAny
  summary: (row: Row) => { primary: string; secondary?: string; meta?: string }
}

const required = (max = 200) => z.string().trim().min(1, "Required").max(max)
const optional = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
const optionalDate = z.union([z.literal(""), date]).transform((value) => value || null)
const optionalUrl = z.union([z.literal(""), z.string().trim().url("Enter a full URL, starting with https://")]).transform((value) => value || null)
const tags = z.array(z.string().trim().min(1).max(100)).max(50)
// One item per line in a textarea.
const lines = z
  .string()
  .max(5000)
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  )
const active = z.boolean()

const month = (value: unknown) =>
  typeof value === "string" && value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    : null

const period = (start: unknown, end: unknown, current?: unknown) =>
  `${month(start) ?? "?"} – ${current ? "Present" : (month(end) ?? "Present")}`

export const ENTITIES = {
  experience: {
    table: "experiences",
    tag: CACHE_TAGS.experience,
    title: "Experience",
    singular: "role",
    description: "Jobs and roles shown on the home and About timelines.",
    sortable: true,
    fields: [
      { name: "title", label: "Role", type: "text", placeholder: "Software Engineer", half: true },
      { name: "company", label: "Company", type: "text", half: true },
      { name: "location", label: "Location", type: "text", placeholder: "Remote", half: true },
      { name: "is_current", label: "I currently work here", type: "switch", half: true },
      { name: "start_date", label: "Start date", type: "date", half: true },
      { name: "end_date", label: "End date", type: "date", half: true, description: "Leave empty if current." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "technologies", label: "Technologies", type: "tags", placeholder: "Add a technology" },
      { name: "achievements", label: "Achievements", type: "lines", description: "One per line." },
      { name: "is_active", label: "Visible on the site", type: "switch" },
    ],
    schema: z.object({
      title: required(),
      company: required(),
      location: optional(),
      is_current: z.boolean(),
      start_date: date,
      end_date: optionalDate,
      description: required(3000),
      technologies: tags,
      achievements: lines,
      is_active: active,
    }),
    summary: (row) => ({
      primary: String(row.title),
      secondary: String(row.company),
      meta: period(row.start_date, row.end_date, row.is_current),
    }),
  },
  education: {
    table: "education",
    tag: CACHE_TAGS.education,
    title: "Education",
    singular: "entry",
    description: "Degrees and courses. Shown newest first on the About page.",
    sortable: false,
    orderBy: "start_date",
    fields: [
      { name: "degree", label: "Degree", type: "text", placeholder: "B.Tech, Computer Science", half: true },
      { name: "institution", label: "Institution", type: "text", half: true },
      { name: "start_date", label: "Start date", type: "date", half: true },
      { name: "end_date", label: "End date", type: "date", half: true, description: "Leave empty if ongoing." },
      { name: "gpa", label: "GPA / grade", type: "text", half: true },
      { name: "thesis", label: "Thesis / project", type: "text", half: true },
      { name: "coursework", label: "Coursework", type: "tags", placeholder: "Add a course" },
      { name: "activities", label: "Activities", type: "tags", placeholder: "Add an activity" },
      { name: "is_active", label: "Visible on the site", type: "switch" },
    ],
    schema: z.object({
      degree: required(),
      institution: required(),
      start_date: date,
      end_date: optionalDate,
      gpa: optional(40),
      thesis: optional(),
      coursework: tags,
      activities: tags,
      is_active: active,
    }),
    summary: (row) => ({
      primary: String(row.degree),
      secondary: String(row.institution),
      meta: period(row.start_date, row.end_date),
    }),
  },
  certifications: {
    table: "certifications",
    tag: CACHE_TAGS.certifications,
    title: "Certifications",
    singular: "certification",
    description: "Listed next to education on the About page.",
    sortable: true,
    fields: [
      { name: "name", label: "Name", type: "text", half: true },
      { name: "issuer", label: "Issuer", type: "text", half: true },
      { name: "issue_date", label: "Issued", type: "date", half: true },
      { name: "expiry_date", label: "Expires", type: "date", half: true },
      { name: "credential_url", label: "Credential URL", type: "url", placeholder: "https://" },
      { name: "is_active", label: "Visible on the site", type: "switch" },
    ],
    schema: z.object({
      name: required(),
      issuer: required(),
      issue_date: date,
      expiry_date: optionalDate,
      credential_url: optionalUrl,
      is_active: active,
    }),
    summary: (row) => ({ primary: String(row.name), secondary: String(row.issuer), meta: month(row.issue_date) ?? undefined }),
  },
  skills: {
    table: "skills",
    tag: CACHE_TAGS.skills,
    title: "Skills",
    singular: "skill",
    description: "Grouped by category on the home and About pages.",
    sortable: true,
    fields: [
      { name: "name", label: "Skill", type: "text", placeholder: "TypeScript", half: true },
      { name: "category", label: "Category", type: "text", placeholder: "Frontend", half: true, suggest: true },
      { name: "level", label: "Level (0–100)", type: "number", half: true, description: "Used for ordering within a category." },
      { name: "is_active", label: "Visible on the site", type: "switch", half: true },
    ],
    schema: z.object({
      name: required(80),
      category: required(80),
      level: z.coerce.number().int().min(0).max(100),
      is_active: active,
    }),
    summary: (row) => ({ primary: String(row.name), secondary: String(row.category), meta: `${row.level}` }),
  },
  interests: {
    table: "interests",
    tag: CACHE_TAGS.interests,
    title: "Interests",
    singular: "interest",
    description: "The “when I’m not coding” list on the About page.",
    sortable: true,
    fields: [
      { name: "emoji", label: "Emoji", type: "text", placeholder: "🎧", half: true },
      { name: "interest", label: "Interest", type: "text", placeholder: "Music", half: true },
      { name: "is_active", label: "Visible on the site", type: "switch" },
    ],
    schema: z.object({ emoji: optional(16), interest: required(80), is_active: active }),
    summary: (row) => ({ primary: `${row.emoji ? `${row.emoji} ` : ""}${row.interest}` }),
  },
  stats: {
    table: "portfolio_stats",
    tag: CACHE_TAGS.stats,
    title: "Stats",
    singular: "stat",
    description: "Numbers that count up on the home page. The “experience” key also feeds the About page.",
    sortable: true,
    fields: [
      { name: "display_name", label: "Label", type: "text", placeholder: "Years of experience", half: true },
      { name: "stat_value", label: "Value", type: "text", placeholder: "3+", half: true },
      { name: "stat_key", label: "Key", type: "text", placeholder: "experience", description: "Lowercase letters, numbers and underscores." },
      { name: "is_active", label: "Visible on the site", type: "switch" },
    ],
    schema: z.object({
      display_name: optional(80),
      stat_value: required(20),
      stat_key: z.string().trim().regex(/^[a-z0-9_]{1,40}$/, "Lowercase letters, numbers and underscores"),
      is_active: active,
    }),
    summary: (row) => ({ primary: String(row.display_name || row.stat_key), meta: String(row.stat_value) }),
  },
} satisfies Record<string, EntityConfig>

export type EntityKey = keyof typeof ENTITIES

export function isEntityKey(value: string): value is EntityKey {
  return Object.hasOwn(ENTITIES, value)
}

// DB row → form values: nulls become "", lists stay arrays (or newline text for "lines").
export function toFormValues(config: EntityConfig, row?: Row): Row {
  const values: Row = {}
  for (const field of config.fields) {
    const value = row?.[field.name]
    switch (field.type) {
      case "switch":
        values[field.name] = row ? Boolean(value) : field.name === "is_active"
        break
      case "tags":
        values[field.name] = Array.isArray(value) ? value : []
        break
      case "lines":
        values[field.name] = Array.isArray(value) ? value.join("\n") : ""
        break
      case "number":
        values[field.name] = value ?? 0
        break
      default:
        values[field.name] = value ?? ""
    }
  }
  return values
}
