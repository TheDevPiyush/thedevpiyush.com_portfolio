"use server"

import { adminAction } from "@/lib/admin/action"
import { supabaseServer } from "@/lib/supabase/server"

export interface CommandRecord {
  id: string
  title: string
  href: string
  kind: "post" | "project" | "message"
}

// Records the admin ⌘K menu can jump to. Loaded when the menu first opens.
export async function getCommandRecords() {
  return adminAction(async (): Promise<CommandRecord[]> => {
    const [posts, projects, messages] = await Promise.all([
      supabaseServer.from("blog_posts").select("id,title").order("updated_at", { ascending: false }).limit(200),
      supabaseServer.from("projects").select("id,title").order("display_order").limit(200),
      supabaseServer
        .from("contact_messages")
        .select("id,name,subject")
        .in("status", ["unread", "read"])
        .order("created_at", { ascending: false })
        .limit(30),
    ])
    return [
      ...(posts.data ?? []).map((post) => ({ id: post.id, title: post.title, href: `/admin/posts/${post.id}`, kind: "post" as const })),
      ...(projects.data ?? []).map((project) => ({
        id: project.id,
        title: project.title,
        href: `/admin/projects/${project.id}`,
        kind: "project" as const,
      })),
      ...(messages.data ?? []).map((message) => ({
        id: message.id,
        title: `${message.name}${message.subject ? ` — ${message.subject}` : ""}`,
        href: `/admin/inbox?message=${message.id}`,
        kind: "message" as const,
      })),
    ]
  })
}
