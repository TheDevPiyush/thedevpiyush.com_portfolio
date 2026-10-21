"use server"

import { z } from "zod"
import { ActionError, adminAction, check, checkRow, parse, revalidate } from "@/lib/admin/action"
import { ENTITIES, isEntityKey, type EntityConfig } from "@/lib/admin/entities"
import { supabaseServer } from "@/lib/supabase/server"

function entityConfig(entity: string): EntityConfig {
  if (!isEntityKey(entity)) throw new ActionError("Unknown section")
  return ENTITIES[entity]
}

const idSchema = z.string().uuid()

export async function saveEntity(entity: string, id: string | null, values: unknown) {
  return adminAction(async () => {
    const config = entityConfig(entity)
    const data = parse(config.schema, values) as Record<string, unknown>
    if (data.is_current) data.end_date = null
    const table = supabaseServer.from(config.table)

    let row: Record<string, unknown>
    if (id) {
      row = checkRow(await table.update(data).eq("id", parse(idSchema, id)).select("*").single())
    } else {
      if (config.sortable) {
        // New rows go to the end of the list.
        const last = await supabaseServer
          .from(config.table)
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1)
          .maybeSingle()
        data.display_order = ((last.data?.display_order as number | undefined) ?? -1) + 1
      }
      row = checkRow(await table.insert(data).select("*").single())
    }

    revalidate(config.tag)
    return row
  })
}

export async function deleteEntity(entity: string, id: string) {
  return adminAction(async () => {
    const config = entityConfig(entity)
    check(await supabaseServer.from(config.table).delete().eq("id", parse(idSchema, id)))
    revalidate(config.tag)
    return null
  })
}

export async function setEntityActive(entity: string, id: string, isActive: boolean) {
  return adminAction(async () => {
    const config = entityConfig(entity)
    check(await supabaseServer.from(config.table).update({ is_active: isActive }).eq("id", parse(idSchema, id)))
    revalidate(config.tag)
    return null
  })
}

// Saves a new drag-and-drop order: display_order = position in `ids`.
export async function reorderEntities(entity: string, ids: string[]) {
  return adminAction(async () => {
    const config = entityConfig(entity)
    if (!config.sortable) throw new ActionError("This section can't be reordered")
    const orderedIds = parse(z.array(idSchema).max(500), ids)
    const results = await Promise.all(
      orderedIds.map((rowId, index) => supabaseServer.from(config.table).update({ display_order: index }).eq("id", rowId)),
    )
    results.forEach((result) => check(result))
    revalidate(config.tag)
    return null
  })
}
