import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/page-header"
import { PostsTable } from "@/components/admin/posts-table"
import { getAdminPosts } from "@/lib/admin/queries"

export const metadata = { title: "Posts" }

export default async function PostsPage() {
  const posts = await getAdminPosts()
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Posts"
        description="Write, schedule and publish posts. Published changes show on the site within seconds."
        actions={
          <Button asChild variant="brand" size="pill-sm">
            <Link href="/admin/posts/new">
              <Plus /> New post
            </Link>
          </Button>
        }
      />
      <PostsTable posts={posts} />
    </div>
  )
}
