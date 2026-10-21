import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProjectsList } from "@/components/admin/projects-list"
import { getAdminProjects } from "@/lib/admin/queries"

export const metadata = { title: "Projects" }

export default async function ProjectsPage() {
  const projects = await getAdminProjects()
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Projects"
        description="Everything on /projects, free or for sale. Drag to change the order on the site."
        actions={
          <Button asChild variant="brand" size="pill-sm">
            <Link href="/admin/projects/new">
              <Plus /> New project
            </Link>
          </Button>
        }
      />
      <ProjectsList
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          category: project.category ?? null,
          image_url: project.image_url ?? null,
          is_active: project.is_active,
          is_featured: project.is_featured,
          is_sellable: Boolean(project.is_sellable),
          price_inr: project.price_inr ? Number(project.price_inr) : null,
        }))}
      />
    </div>
  )
}
