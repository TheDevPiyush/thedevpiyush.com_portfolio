import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminCommandMenu } from "@/components/admin/admin-command-menu"
import { ConfirmDialogHost } from "@/components/admin/confirm-dialog"
import { IgnoreOwnVisits } from "@/components/admin/ignore-own-visits"
import { NoAccess } from "@/components/admin/no-access"
import { getAuthUser, requireAdmin } from "@/lib/auth/server-auth"
import { getUnreadMessageCount } from "@/lib/admin/queries"

// Every page below this layout is admin-only. Server actions re-check on their own (lib/admin/action.ts).
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) {
    const user = await getAuthUser()
    if (!user) redirect("/admin/signin")
    return <NoAccess email={user.email} />
  }

  const [unread, cookieStore] = await Promise.all([getUnreadMessageCount(), cookies()])
  const sidebarOpen = cookieStore.get("sidebar:state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AdminSidebar email={admin.email} unread={unread} />
      <SidebarInset className="min-w-0">
        <AdminHeader />
        <div className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">{children}</div>
      </SidebarInset>
      <AdminCommandMenu />
      <ConfirmDialogHost />
      <IgnoreOwnVisits />
    </SidebarProvider>
  )
}
