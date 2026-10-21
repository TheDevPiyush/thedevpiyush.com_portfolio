"use server"

import { z } from "zod"
import { ActionError, adminAction, check, parse } from "@/lib/admin/action"
import { supabaseServer } from "@/lib/supabase/server"

const ids = z.array(z.string().uuid()).min(1).max(500)

// ---------- Inbox ----------

export async function setMessageStatus(messageIds: string[], status: "unread" | "read" | "archived" | "spam") {
  return adminAction(async () => {
    const nextStatus = parse(z.enum(["unread", "read", "archived", "spam"]), status)
    check(await supabaseServer.from("contact_messages").update({ status: nextStatus }).in("id", parse(ids, messageIds)))
    return null
  })
}

export async function deleteMessages(messageIds: string[]) {
  return adminAction(async () => {
    check(await supabaseServer.from("contact_messages").delete().in("id", parse(ids, messageIds)))
    return null
  })
}

// ---------- Sales ----------

// Records a refund made in the Razorpay dashboard; the buyer loses access to the download.
export async function markPurchaseRefunded(purchaseId: string) {
  return adminAction(async () => {
    const updated = check(
      await supabaseServer
        .from("project_purchases")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("id", parse(z.string().uuid(), purchaseId))
        .eq("status", "paid")
        .select("id"),
    )
    if (!updated?.length) throw new ActionError("Only paid purchases can be marked as refunded.")
    return null
  })
}

// ---------- Users ----------

export async function setUserAdmin(userId: string, isAdmin: boolean) {
  return adminAction(async (admin) => {
    const id = parse(z.string().uuid(), userId)
    if (id === admin.id) throw new ActionError("You can't change your own admin access.")
    check(await supabaseServer.from("users").update({ isAdmin }).eq("id", id))
    return null
  })
}
