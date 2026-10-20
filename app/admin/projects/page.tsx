import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/server-auth"
import { AdminBar } from "@/components/admin/admin-bar"
import { ProjectUploadForm } from "@/components/project-upload-form"

export default async function AdminProjectsPage() {
  if (!(await requireAdmin())) {
    redirect("/admin/signin")
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <AdminBar />
      <div className="pt-24 px-6 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "rgb(var(--color-text-primary))" }}>
              Manage Paid Projects
            </h1>
            <p style={{ color: "rgb(var(--color-text-secondary))" }}>
              Create and edit sellable projects, including ZIP, setup guide, and project images.
            </p>
          </div>
          <ProjectUploadForm />
        </div>
      </div>
    </div>
  )
}
