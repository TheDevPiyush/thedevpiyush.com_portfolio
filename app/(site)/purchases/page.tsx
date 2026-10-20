import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, PageHeader } from "@/components/site/section"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { getAuthUser } from "@/lib/auth/server-auth"
import { supabaseServer } from "@/lib/supabase/server"
import { formatDate } from "@/lib/formatters/date"
import { DownloadButton } from "./download-button"

export const metadata: Metadata = {
  title: "My purchases",
  robots: { index: false, follow: false },
}

interface PurchaseRow {
  id: string
  project_id: string
  amount_inr: number
  paid_at: string | null
  razorpay_payment_id: string | null
  projects: { title: string; image_url: string | null; is_sellable: boolean } | null
}

export default async function PurchasesPage() {
  const user = await getAuthUser()
  if (!user) redirect("/signin?next=/purchases")

  const { data, error } = await supabaseServer
    .from("project_purchases")
    .select("id,project_id,amount_inr,paid_at,razorpay_payment_id,projects(title,image_url,is_sellable)")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .returns<PurchaseRow[]>()

  if (error) throw new Error(error.message)

  // One row per project, newest payment first.
  const purchases = [...new Map((data ?? []).map((row) => [row.project_id, row])).values()]
  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={
          <>
            My purchases<span className="italic text-muted-foreground">.</span>
          </>
        }
        lede={`Signed in as ${user.email ?? "you"}. Download links are generated fresh each time and expire after two minutes.`}
      />

      <Container className="border-t pb-24 pt-12">
        {purchases.length === 0 ? (
          <Reveal className="flex flex-col items-start gap-5 rounded-3xl border border-dashed p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-medium">No purchases yet</h2>
              <p className="text-muted-foreground">Projects you buy will show up here, ready to download any time.</p>
            </div>
            <Button asChild variant="brand" size="pill" className="group">
              <Link href="/projects">
                Browse projects
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </Reveal>
        ) : (
          <Reveal as="ul" stagger={0.06} className="divide-y overflow-hidden rounded-3xl border">
            {purchases.map((purchase) => (
              <RevealItem as="li" key={purchase.id} className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl border bg-muted sm:w-40">
                  {purchase.projects?.image_url && (
                    <Image src={purchase.projects.image_url} alt="" fill sizes="160px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="text-lg font-medium tracking-tight">{purchase.projects?.title ?? "Removed project"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currency.format(Number(purchase.amount_inr))}
                    {purchase.paid_at && <> · Paid {formatDate(purchase.paid_at)}</>}
                  </p>
                  {purchase.razorpay_payment_id && (
                    <p className="font-mono text-xs text-muted-foreground">{purchase.razorpay_payment_id}</p>
                  )}
                </div>
                {purchase.projects?.is_sellable ? (
                  <DownloadButton projectId={purchase.project_id} />
                ) : (
                  <p className="text-sm text-muted-foreground">No longer available</p>
                )}
              </RevealItem>
            ))}
          </Reveal>
        )}
      </Container>
    </>
  )
}
