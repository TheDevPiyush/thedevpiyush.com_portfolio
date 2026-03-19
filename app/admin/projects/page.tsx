import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { NavigationMenu } from "@/components/navigation-menu"
import { ProjectUploadForm } from "@/components/project-upload-form"

export default async function AdminProjectsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/admin/signin")
  }

  const decoded = jwtDecode<{ sub: string }>(token)
  const userId = decoded.sub

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId }),
    cache: "no-store",
  })

  if (!response.ok) {
    redirect("/")
  }

  const result = await response.json()
  const userData = result.data?.[0]
  if (!userData?.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <NavigationMenu />
      <div className="pt-24 px-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Upload Paid Project</h1>
        <ProjectUploadForm />
      </div>
    </div>
  )
}
