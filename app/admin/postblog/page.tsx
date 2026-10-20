import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/server-auth"
import { BlogForm } from "@/components/blog-form"
import { NavigationMenu } from "@/components/navigation-menu"

export default async function AdminPage() {
    if (!(await requireAdmin())) {
        redirect("/admin/signin")
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
            <NavigationMenu />
            <BlogForm />
        </div>
    )
}
