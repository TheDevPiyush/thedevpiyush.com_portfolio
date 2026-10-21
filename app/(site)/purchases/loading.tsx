import { Container } from "@/components/site/section"
import { Skeleton } from "@/components/ui/skeleton"

export default function PurchasesLoading() {
  return (
    <Container className="space-y-6 pb-24 pt-24" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-32 rounded-full" />
      <Skeleton className="h-16 w-full max-w-2xl rounded-2xl" />
      <Skeleton className="h-5 w-full max-w-xl rounded-full" />
      <div className="grid gap-4 pt-10 sm:grid-cols-2">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    </Container>
  )
}
