import { IndianRupee, Receipt, RotateCcw, TrendingUp } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { SalesTable } from "@/components/admin/sales-table"
import { StatTile, formatInr } from "@/components/admin/stat-tile"
import { getPurchases } from "@/lib/admin/queries"

export const metadata = { title: "Sales" }

export default async function SalesPage() {
  const purchases = await getPurchases()
  const monthAgo = Date.now() - 30 * 86_400_000
  const paid = purchases.filter((row) => row.status === "paid")
  const recent = paid.filter((row) => new Date(row.paid_at ?? row.created_at).getTime() >= monthAgo)
  const refunded = purchases.filter((row) => row.status === "refunded")
  const sum = (rows: typeof purchases) => rows.reduce((total, row) => total + Number(row.amount_inr), 0)

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Sales" description="Project purchases through Razorpay. Refunds are issued in the Razorpay dashboard." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total revenue" value={formatInr(sum(paid))} icon={<IndianRupee />} footnote={`${paid.length} paid sale${paid.length === 1 ? "" : "s"}`} />
        <StatTile label="Last 30 days" value={formatInr(sum(recent))} icon={<TrendingUp />} footnote={`${recent.length} sale${recent.length === 1 ? "" : "s"}`} />
        <StatTile
          label="Average order"
          value={paid.length ? formatInr(sum(paid) / paid.length) : "—"}
          icon={<Receipt />}
        />
        <StatTile label="Refunded" value={formatInr(sum(refunded))} icon={<RotateCcw />} footnote={`${refunded.length} refund${refunded.length === 1 ? "" : "s"}`} />
      </div>
      <SalesTable purchases={purchases} />
    </div>
  )
}
