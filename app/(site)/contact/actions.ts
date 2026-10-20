"use server"

import crypto from "crypto"
import { headers } from "next/headers"
import { z } from "zod"
import { supabaseServer } from "@/lib/supabase/server"
import { getCachedPersonalInfo } from "@/lib/data/cached"

const messageSchema = z.object({
  name: z.string().trim().min(1, "Please tell me your name").max(120),
  email: z.string().trim().email("That email doesn't look right").max(254),
  subject: z.string().trim().max(200).optional().transform((value) => value || null),
  message: z.string().trim().min(10, "A little more detail, please (10+ characters)").max(5000),
})

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error"
      message: string
      fieldErrors?: Partial<Record<ContactField, string>>
      // React resets the form after every action, so echo the input back to refill it.
      values?: Partial<Record<ContactField, string>>
    }

type ContactField = "name" | "email" | "subject" | "message"

const MAX_PER_HOUR = 5

export async function sendContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { status: "success" }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  }
  const parsed = messageSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([key, errors]) => [key, errors?.[0]]),
    )
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values }
  }

  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown"
  const ipHash = crypto.createHash("sha256").update(`contact:${ip}`).digest("hex")

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabaseServer
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since)
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return {
      status: "error",
      message: "You've sent a few messages already. Please try again in an hour, or email me directly.",
      values,
    }
  }

  const message = { ...parsed.data, ip_hash: ipHash, user_agent: requestHeaders.get("user-agent")?.slice(0, 300) ?? null }
  const { error: insertError } = await supabaseServer.from("contact_messages").insert(message)
  if (insertError) console.error("contact_messages insert failed:", insertError.message)

  const emailed = await notifyByEmail(parsed.data).catch((error) => {
    console.error("Contact notification failed:", error)
    return false
  })

  // Succeed if the message landed anywhere I'll see it.
  if (insertError && !emailed) {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email me directly instead.",
      values,
    }
  }
  return { status: "success" }
}

async function notifyByEmail(message: z.infer<typeof messageSchema>): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return false

  const to = process.env.CONTACT_NOTIFY_EMAIL || (await getCachedPersonalInfo().catch(() => null))?.email
  if (!to) return false

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: message.email,
      subject: `New message: ${message.subject ?? `from ${message.name}`}`,
      text: `${message.name} <${message.email}> wrote:\n\n${message.message}\n\n— Sent from the contact form on thedevpiyush.com`,
    }),
  })
  if (!response.ok) throw new Error(`Resend responded ${response.status}: ${await response.text()}`)
  return true
}
