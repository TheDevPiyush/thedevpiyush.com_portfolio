"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink, EyeOff, MoreHorizontal, Pencil, Send, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, FilterTabs, SortHeader } from "./data-table"
import { StatusBadge } from "./status-badge"
import { confirm } from "./confirm-dialog"
import { postStatus, STATUS_STYLES, type PostStatus } from "@/lib/admin/post-status"
import { runAction } from "@/lib/admin/run-action"
import { deletePost, setPostPublished } from "@/app/admin/_actions/posts"
import type { AdminPostRow } from "@/lib/admin/queries"
import { formatDate } from "@/lib/formatters/date"

type Filter = "all" | PostStatus

export function PostsTable({ posts }: { posts: AdminPostRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")

  const withStatus = useMemo(() => posts.map((post) => ({ ...post, status: postStatus(post) })), [posts])
  const counts = (status: PostStatus) => withStatus.filter((post) => post.status === status).length
  const visible = filter === "all" ? withStatus : withStatus.filter((post) => post.status === filter)

  const setPublished = async (ids: string[], published: boolean) => {
    const results = await Promise.all(ids.map((id) => runAction(setPostPublished(id, published))))
    if (results.every((result) => result !== undefined)) {
      router.refresh()
      return true
    }
    router.refresh()
    return false
  }

  const remove = async (rows: AdminPostRow[]) => {
    const title = rows.length === 1 ? `Delete “${rows[0].title}”?` : `Delete ${rows.length} posts?`
    if (!(await confirm({ title, description: "Deleted posts can't be recovered.", confirmLabel: "Delete", destructive: true }))) return false
    await Promise.all(rows.map((row) => runAction(deletePost(row.id))))
    router.refresh()
    return true
  }

  const columns: ColumnDef<(typeof withStatus)[number], unknown>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader column={column}>Title</SortHeader>,
      cell: ({ row }) => (
        <div className="min-w-[14rem] max-w-md">
          <p className="flex items-center gap-1.5 truncate font-medium">
            {row.original.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
            {row.original.title}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">/blog/{row.original.url}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge className={STATUS_STYLES[row.original.status]}>{row.original.status}</StatusBadge>,
    },
    {
      accessorKey: "publish_date",
      header: ({ column }) => <SortHeader column={column}>Date</SortHeader>,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.publish_date)}</span>,
    },
    {
      accessorKey: "view_count",
      header: ({ column }) => <SortHeader column={column}>Views</SortHeader>,
      cell: ({ row }) => <span className="tabular-nums">{(row.original.view_count ?? 0).toLocaleString("en-US")}</span>,
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => <SortHeader column={column}>Updated</SortHeader>,
      cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const post = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Post actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem asChild>
                <Link href={`/admin/posts/${post.id}`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              {post.status === "published" ? (
                <DropdownMenuItem asChild>
                  <a href={`/blog/${post.url}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> View on site
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/posts/${post.id}/preview`}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Preview
                  </Link>
                </DropdownMenuItem>
              )}
              {post.is_published ? (
                <DropdownMenuItem onSelect={() => setPublished([post.id], false)}>
                  <EyeOff className="mr-2 h-4 w-4" /> Move to drafts
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => setPublished([post.id], true)}>
                  <Send className="mr-2 h-4 w-4" /> Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => remove([post])} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
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
      getRowId={(post) => post.id}
      searchPlaceholder="Search posts"
      searchText={(post) => `${post.title} ${post.url} ${post.excerpt} ${(post.tags ?? []).join(" ")}`}
      initialSorting={[{ id: "publish_date", desc: true }]}
      onRowClick={(post) => router.push(`/admin/posts/${post.id}`)}
      emptyMessage={
        filter === "all" ? (
          <>
            No posts yet.{" "}
            <Link href="/admin/posts/new" className="text-foreground underline underline-offset-4">
              Write the first one
            </Link>
          </>
        ) : (
          `No ${filter} posts.`
        )
      }
      toolbar={
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: withStatus.length },
            { value: "published", label: "Published", count: counts("published") },
            { value: "scheduled", label: "Scheduled", count: counts("scheduled") },
            { value: "draft", label: "Drafts", count: counts("draft") },
          ]}
        />
      }
      bulkActions={(rows, clear) => (
        <>
          <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={async () => (await setPublished(rows.map((row) => row.id), true)) && clear()}>
            <Send /> Publish
          </Button>
          <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={async () => (await setPublished(rows.map((row) => row.id), false)) && clear()}>
            <EyeOff /> Move to drafts
          </Button>
          <Button size="sm" variant="outline" className="h-8 rounded-full text-destructive" onClick={async () => (await remove(rows)) && clear()}>
            <Trash2 /> Delete
          </Button>
        </>
      )}
    />
  )
}
