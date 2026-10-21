import "server-only"
import { revalidateTag } from "next/cache"
import { ZodError, type ZodType, type ZodTypeDef } from "zod"
import { requireAdmin, type AuthUser } from "@/lib/auth/server-auth"
import type { CacheTag } from "@/lib/data/cache-tags"

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }

export class ActionError extends Error {}

// Every admin server action runs through this: verify the admin, run, and turn failures into a
// result the client can toast instead of an opaque 500.
export async function adminAction<T>(run: (admin: AuthUser) => Promise<T>): Promise<ActionResult<T>> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: "You need to be signed in as an admin." }

  try {
    return { ok: true, data: await run(admin) }
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues[0]
      return { ok: false, error: issue ? `${issue.path.join(".") || "Input"}: ${issue.message}` : "Invalid input" }
    }
    if (error instanceof ActionError) return { ok: false, error: error.message }
    console.error("Admin action failed:", error)
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" }
  }
}

export function parse<Output, Input>(schema: ZodType<Output, ZodTypeDef, Input>, input: unknown): Output {
  return schema.parse(input)
}

type DbResult<D> = { data: D; error: { message: string; code?: string } | null }

// Supabase returns { data, error }; throw so adminAction reports the error.
export function check<D>(result: DbResult<D>, label = "Database"): D {
  if (result.error) {
    if (result.error.code === "23505") throw new ActionError("That value is already taken.")
    throw new ActionError(`${label}: ${result.error.message}`)
  }
  return result.data
}

/** Like check(), for .single() reads and writes that must return a row. */
export function checkRow<D>(result: DbResult<D>, label = "Database"): NonNullable<D> {
  const data = check(result, label)
  if (data == null) throw new ActionError(`${label}: row not found`)
  return data
}

export function revalidate(...tags: CacheTag[]) {
  for (const tag of tags) revalidateTag(tag)
}
