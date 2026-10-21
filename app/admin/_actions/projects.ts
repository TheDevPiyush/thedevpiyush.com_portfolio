"use server"

import { z } from "zod"
import { ActionError, adminAction, check, checkRow, parse, revalidate } from "@/lib/admin/action"
import { projectSchema } from "@/lib/admin/schemas"
import { projectFileRef, removePublicUrls, removeStoredFiles, setupGuideRef } from "@/lib/admin/storage"
import { CACHE_TAGS } from "@/lib/data/cache-tags"
import { supabaseServer } from "@/lib/supabase/server"

const idSchema = z.string().uuid()

// New projects get their id from the editor up front, so uploads can be filed under it before the
// first save. Creates the row when it doesn't exist yet.
export async function saveProject(id: string, values: unknown) {
  return adminAction(async () => {
    const projectId = parse(idSchema, id)
    const project = parse(projectSchema, values)

    const payload = {
      title: project.title,
      description: project.description,
      long_description: project.long_description,
      category: project.category,
      tech_stack: project.tech_stack,
      features: project.features,
      stats: project.stats.length ? Object.fromEntries(project.stats.map(({ key, value }) => [key, value])) : null,
      github_url: project.github_url,
      live_url: project.live_url,
      demo_url: project.demo_url,
      image_url: project.image_url,
      screenshot_urls: project.screenshot_urls,
      is_active: project.is_active,
      is_featured: project.is_featured,
      is_sellable: project.is_sellable,
      price_inr: project.price_inr === "" ? null : project.price_inr,
      download_file_path: project.download_file_path,
      setup_guide_file_path: project.setup_guide_file_path,
    }

    const existing = check(
      await supabaseServer
        .from("projects")
        .select("image_url,screenshot_urls,download_file_path,setup_guide_file_path")
        .eq("id", projectId)
        .maybeSingle(),
    )

    if (existing) {
      check(await supabaseServer.from("projects").update(payload).eq("id", projectId))
      // Files that were replaced or removed in this save.
      await Promise.all([
        removePublicUrls([
          existing.image_url !== payload.image_url ? existing.image_url : null,
          ...((existing.screenshot_urls ?? []) as string[]).filter((url) => !payload.screenshot_urls.includes(url)),
        ]),
        removeStoredFiles([
          existing.download_file_path !== payload.download_file_path ? projectFileRef(existing.download_file_path) : null,
          existing.setup_guide_file_path !== payload.setup_guide_file_path ? setupGuideRef(existing.setup_guide_file_path) : null,
        ]),
      ])
    } else {
      const last = await supabaseServer
        .from("projects")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle()
      const displayOrder = ((last.data?.display_order as number | undefined) ?? -1) + 1
      check(await supabaseServer.from("projects").insert({ id: projectId, ...payload, display_order: displayOrder }))
    }

    revalidate(CACHE_TAGS.projects)
    return { id: projectId, created: !existing }
  })
}

// Projects someone paid for can't be deleted (buyers keep their downloads); hide them instead.
export async function deleteProject(id: string) {
  return adminAction(async () => {
    const projectId = parse(idSchema, id)
    const { count } = await supabaseServer
      .from("project_purchases")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .in("status", ["paid", "refunded"])
    if (count) {
      throw new ActionError(`This project has ${count} purchase${count === 1 ? "" : "s"}. Hide it instead of deleting it.`)
    }

    const project = checkRow(
      await supabaseServer
        .from("projects")
        .select("image_url,screenshot_urls,download_file_path,setup_guide_file_path")
        .eq("id", projectId)
        .single(),
    )
    // Abandoned checkouts reference the project too.
    check(await supabaseServer.from("project_purchases").delete().eq("project_id", projectId))
    check(await supabaseServer.from("projects").delete().eq("id", projectId))

    await Promise.all([
      removePublicUrls([project.image_url, ...((project.screenshot_urls ?? []) as string[])]),
      removeStoredFiles([projectFileRef(project.download_file_path), setupGuideRef(project.setup_guide_file_path)]),
    ])
    revalidate(CACHE_TAGS.projects)
    return null
  })
}

export async function setProjectFlag(id: string, flag: "is_active" | "is_featured", value: boolean) {
  return adminAction(async () => {
    const field = parse(z.enum(["is_active", "is_featured"]), flag)
    check(await supabaseServer.from("projects").update({ [field]: value }).eq("id", parse(idSchema, id)))
    revalidate(CACHE_TAGS.projects)
    return null
  })
}

export async function reorderProjects(ids: string[]) {
  return adminAction(async () => {
    const orderedIds = parse(z.array(idSchema).max(500), ids)
    const results = await Promise.all(
      orderedIds.map((projectId, index) => supabaseServer.from("projects").update({ display_order: index }).eq("id", projectId)),
    )
    results.forEach((result) => check(result))
    revalidate(CACHE_TAGS.projects)
    return null
  })
}
