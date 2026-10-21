"use server"

import { adminAction, check, parse, revalidate } from "@/lib/admin/action"
import { profileSchema } from "@/lib/admin/schemas"
import { removePublicUrls } from "@/lib/admin/storage"
import { CACHE_TAGS } from "@/lib/data/cache-tags"
import { settingsSchema, type SettingsKey } from "@/lib/settings"
import { supabaseServer } from "@/lib/supabase/server"

export async function saveProfile(values: unknown) {
  return adminAction(async () => {
    const profile = parse(profileSchema, values)
    const existing = check(await supabaseServer.from("personal_info").select("id,image").limit(1).maybeSingle())

    if (existing) {
      check(await supabaseServer.from("personal_info").update(profile).eq("id", existing.id))
      if (existing.image !== profile.image) await removePublicUrls([existing.image])
    } else {
      check(await supabaseServer.from("personal_info").insert(profile))
    }

    revalidate(CACHE_TAGS.profile)
    return null
  })
}

export async function saveSettings(values: unknown) {
  return adminAction(async () => {
    const settings = parse(settingsSchema, values)
    const previous = await supabaseServer.from("site_settings").select("value").eq("key", "resume").maybeSingle()

    const rows = (Object.keys(settings) as SettingsKey[]).map((key) => ({ key, value: settings[key] }))
    check(await supabaseServer.from("site_settings").upsert(rows, { onConflict: "key" }))

    const previousResume = (previous.data?.value as { url?: string } | undefined)?.url
    if (previousResume && previousResume !== settings.resume.url) await removePublicUrls([previousResume])

    revalidate(CACHE_TAGS.settings)
    return null
  })
}
