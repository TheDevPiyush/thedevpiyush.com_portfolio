"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Shield, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, FilterTabs, SortHeader } from "./data-table"
import { StatusBadge } from "./status-badge"
import { confirm } from "./confirm-dialog"
import { runAction } from "@/lib/admin/run-action"
import { setUserAdmin } from "@/app/admin/_actions/business"
import type { AdminUserRow } from "@/lib/admin/queries"

type Filter = "all" | "admins" | "customers"

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString([], { dateStyle: "medium" }) : "—")

export function UsersTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")
  const visible = useMemo(
    () => users.filter((user) => (filter === "admins" ? user.isAdmin : filter === "customers" ? user.purchases > 0 : true)),
    [users, filter],
  )

  const toggleAdmin = async (user: AdminUserRow) => {
    const makeAdmin = !user.isAdmin
    const ok = await confirm({
      title: makeAdmin ? `Make ${user.email} an admin?` : `Remove admin access from ${user.email}?`,
      description: makeAdmin ? "They'll be able to edit everything on the site, see messages and sales." : undefined,
      confirmLabel: makeAdmin ? "Make admin" : "Remove access",
      destructive: makeAdmin,
    })
    if (ok && (await runAction(setUserAdmin(user.id, makeAdmin), makeAdmin ? "Admin access granted" : "Admin access removed")) !== undefined)
      router.refresh()
  }

  const columns: ColumnDef<AdminUserRow, unknown>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => <SortHeader column={column}>Email</SortHeader>,
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase">{row.original.email.charAt(0)}</span>
          <span className="truncate text-sm">{row.original.email}</span>
          {row.original.id === currentUserId && <span className="text-xs text-muted-foreground">(you)</span>}
        </span>
      ),
    },
    {
      accessorKey: "provider",
      header: "Sign-in",
      cell: ({ row }) => <span className="text-sm capitalize text-muted-foreground">{row.original.provider === "email" ? "Email code" : (row.original.provider ?? "—")}</span>,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <SortHeader column={column}>Joined</SortHeader>,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{date(row.original.created_at)}</span>,
    },
    {
      accessorKey: "lastSignInAt",
      header: ({ column }) => <SortHeader column={column}>Last sign-in</SortHeader>,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{date(row.original.lastSignInAt)}</span>,
    },
    {
      accessorKey: "purchases",
      header: ({ column }) => <SortHeader column={column}>Purchases</SortHeader>,
      cell: ({ row }) => <span className="tabular-nums">{row.original.purchases}</span>,
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) =>
        row.original.isAdmin ? <StatusBadge className="border-brand/30 bg-brand/10 text-brand">Admin</StatusBadge> : null,
    },
    {
      id: "actions",
      cell: ({ row }) =>
        row.original.id === currentUserId ? null : (
          <Button variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => toggleAdmin(row.original)}>
            {row.original.isAdmin ? <ShieldOff /> : <Shield />}
            {row.original.isAdmin ? "Remove admin" : "Make admin"}
          </Button>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={visible}
      getRowId={(user) => user.id}
      searchPlaceholder="Search by email"
      searchText={(user) => user.email}
      initialSorting={[{ id: "created_at", desc: true }]}
      emptyMessage="No users yet."
      toolbar={
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: users.length },
            { value: "customers", label: "Customers", count: users.filter((user) => user.purchases > 0).length },
            { value: "admins", label: "Admins", count: users.filter((user) => user.isAdmin).length },
          ]}
        />
      }
    />
  )
}
