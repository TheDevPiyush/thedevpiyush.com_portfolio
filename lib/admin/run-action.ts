"use client"

import { toast } from "sonner"
import type { ActionResult } from "./action"

/** Awaits a server action and toasts the outcome. Returns the data, or undefined on failure. */
export async function runAction<T>(action: Promise<ActionResult<T>>, success?: string): Promise<T | undefined> {
  try {
    const result = await action
    if (!result.ok) {
      toast.error(result.error)
      return undefined
    }
    if (success) toast.success(success)
    return result.data
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Something went wrong")
    return undefined
  }
}
