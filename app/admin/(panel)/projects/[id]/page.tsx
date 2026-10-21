import { notFound } from "next/navigation"
import { ProjectEditor } from "@/components/admin/project-editor"
import { getAdminProject, getPaidPurchaseCount, getProjectCategories } from "@/lib/admin/queries"
import { projectToForm } from "@/lib/admin/project-form"

export const metadata = { title: "Edit project" }

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const [project, categories, purchases] = await Promise.all([getAdminProject(id), getProjectCategories(), getPaidPurchaseCount(id)])
  if (!project) notFound()

  return <ProjectEditor key={project.id} id={project.id} isNew={false} initial={projectToForm(project)} categories={categories} purchases={purchases} />
}
