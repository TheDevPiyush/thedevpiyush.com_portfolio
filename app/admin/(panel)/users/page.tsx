import { AdminPageHeader } from "@/components/admin/page-header"
import { UsersTable } from "@/components/admin/users-table"
import { getAdminUsers } from "@/lib/admin/queries"
import { requireAdmin } from "@/lib/auth/server-auth"

export const metadata = { title: "Users" }

export default async function UsersPage() {
  const [users, admin] = await Promise.all([getAdminUsers(), requireAdmin()])
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Users" description="Everyone who has signed in, for purchases or admin access." />
      <UsersTable users={users} currentUserId={admin?.id ?? ""} />
    </div>
  )
}
