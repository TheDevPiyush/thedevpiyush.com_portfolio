"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Copy, Download, ExternalLink, MoreHorizontal, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, FilterTabs, SortHeader } from "./data-table"
import { StatusBadge } from "./status-badge"
import { formatInr } from "./stat-tile"
import { confirm } from "./confirm-dialog"
import { runAction } from "@/lib/admin/run-action"
import { markPurchaseRefunded } from "@/app/admin/_actions/business"
import type { PurchaseRow } from "@/lib/admin/queries"

type Filter = "all" | PurchaseRow["status"]

const STATUS_STYLES: Record<PurchaseRow["status"], string> = {
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  created: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  failed: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  expired: "border-border bg-muted text-muted-foreground",
  refunded: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
}
const STATUS_LABELS: Record<PurchaseRow["status"], string> = {
  paid: "Paid",
  created: "Pending",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
}

function toCsv(rows: PurchaseRow[]) {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`
  const header = ["Date", "Status", "Amount (INR)", "Customer", "Project", "Razorpay order", "Razorpay payment"]
  const lines = rows.map((row) =>
    [row.paid_at ?? row.created_at, row.status, row.amount_inr, row.user?.email, row.project?.title, row.razorpay_order_id, row.razorpay_payment_id]
      .map(escape)
      .join(","),
  )
  return [header.map(escape).join(","), ...lines].join("\n")
}

export function SalesTable({ purchases }: { purchases: PurchaseRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("paid")
  const visible = useMemo(() => (filter === "all" ? purchases : purchases.filter((row) => row.status === filter)), [purchases, filter])
  const count = (status: PurchaseRow["status"]) => purchases.filter((row) => row.status === status).length

  const refund = async (row: PurchaseRow) => {
    const ok = await confirm({
      title: "Mark as refunded?",
      description: `Refund ${formatInr(Number(row.amount_inr))} in the Razorpay dashboard first. This only records it here, and ${row.user?.email ?? "the buyer"} loses download access.`,
      confirmLabel: "Mark refunded",
      destructive: true,
    })
    if (ok && (await runAction(markPurchaseRefunded(row.id), "Marked as refunded")) !== undefined) router.refresh()
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(visible)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = Object.assign(document.createElement("a"), { href: url, download: `sales-${new Date().toISOString().slice(0, 10)}.csv` })
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns: ColumnDef<PurchaseRow, unknown>[] = [
    {
      id: "date",
      accessorFn: (row) => row.paid_at ?? row.created_at,
      header: ({ column }) => <SortHeader column={column}>Date</SortHeader>,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-sm">
          {new Date(getValue() as string).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => row.user?.email ?? "",
      header: ({ column }) => <SortHeader column={column}>Customer</SortHeader>,
      cell: ({ row }) => <span className="text-sm">{row.original.user?.email ?? "—"}</span>,
    },
    {
      id: "project",
      accessorFn: (row) => row.project?.title ?? "",
      header: ({ column }) => <SortHeader column={column}>Project</SortHeader>,
      cell: ({ row }) =>
        row.original.project ? (
          <Link href={`/admin/projects/${row.original.project.id}`} onClick={(event) => event.stopPropagation()} className="text-sm hover:underline">
            {row.original.project.title}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      id: "amount",
      accessorFn: (row) => Number(row.amount_inr),
      header: ({ column }) => <SortHeader column={column}>Amount</SortHeader>,
      cell: ({ getValue }) => <span className="tabular-nums">{formatInr(getValue() as number)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge className={STATUS_STYLES[row.original.status]}>{STATUS_LABELS[row.original.status]}</StatusBadge>,
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) =>
        row.original.razorpay_payment_id ? (
          <span className="font-mono text-xs text-muted-foreground">{row.original.razorpay_payment_id}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const purchase = row.original
        if (!purchase.razorpay_payment_id && !purchase.razorpay_order_id) return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Sale actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {purchase.razorpay_payment_id && (
                <>
                  <DropdownMenuItem asChild>
                    <a href={`https://dashboard.razorpay.com/app/payments/${purchase.razorpay_payment_id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Open in Razorpay
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={async () => {
                      await navigator.clipboard.writeText(purchase.razorpay_payment_id ?? "")
                      toast.success("Payment ID copied")
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy payment ID
                  </DropdownMenuItem>
                </>
              )}
              {purchase.status === "paid" && (
                <DropdownMenuItem onSelect={() => refund(purchase)} className="text-destructive focus:text-destructive">
                  <RotateCcw className="mr-2 h-4 w-4" /> Mark as refunded
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={visible}
      getRowId={(row) => row.id}
      searchPlaceholder="Search by email, project or payment ID"
      searchText={(row) => `${row.user?.email ?? ""} ${row.project?.title ?? ""} ${row.razorpay_payment_id ?? ""} ${row.razorpay_order_id ?? ""}`}
      initialSorting={[{ id: "date", desc: true }]}
      emptyMessage={filter === "paid" ? "No sales yet." : "Nothing here."}
      toolbar={
        <>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "paid", label: "Paid", count: count("paid") },
              { value: "created", label: "Pending", count: count("created") },
              { value: "failed", label: "Failed", count: count("failed") },
              { value: "refunded", label: "Refunded", count: count("refunded") },
              { value: "all", label: "All", count: purchases.length },
            ]}
          />
          <Button variant="outline" size="pill-sm" onClick={exportCsv} disabled={!visible.length}>
            <Download /> CSV
          </Button>
        </>
      }
    />
  )
}
