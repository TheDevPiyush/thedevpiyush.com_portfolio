import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { EntityManager } from "@/components/admin/entity-manager"
import { ENTITIES, isEntityKey } from "@/lib/admin/entities"
import { getEntityRows } from "@/lib/admin/queries"

interface EntityPageProps {
  params: Promise<{ entity: string }>
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { entity } = await params
  return { title: isEntityKey(entity) ? ENTITIES[entity].title : "Not found" }
}

// /admin/experience, /admin/skills, … (static admin routes take precedence over this one).
export default async function EntityPage({ params }: EntityPageProps) {
  const { entity } = await params
  if (!isEntityKey(entity)) notFound()

  const rows = (await getEntityRows(entity)) as (Record<string, unknown> & { id: string })[]
  return <EntityManager entity={entity} rows={rows} />
}
