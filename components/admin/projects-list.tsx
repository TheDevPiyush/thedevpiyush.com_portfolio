"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ImageOff, MoreHorizontal, Pencil, Search, Star, StarOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortableList } from "./sortable-list"
import { StatusBadge } from "./status-badge"
import { confirm } from "./confirm-dialog"
import { runAction } from "@/lib/admin/run-action"
import { deleteProject, reorderProjects, setProjectFlag } from "@/app/admin/_actions/projects"
import { cn } from "@/lib/utils"

export interface ProjectListItem {
  id: string
  title: string
  description: string
  category: string | null
  image_url: string | null
  is_active: boolean
  is_featured: boolean
  is_sellable: boolean
  price_inr: number | null
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(projects)
  const [query, setQuery] = useState("")
  useEffect(() => setItems(projects), [projects])

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const visible = terms.length
    ? items.filter((project) => terms.every((term) => `${project.title} ${project.category ?? ""} ${project.description}`.toLowerCase().includes(term)))
    : items

  const reorder = async (next: ProjectListItem[]) => {
    const previous = items
    setItems(next)
    if ((await runAction(reorderProjects(next.map((project) => project.id)))) === undefined) setItems(previous)
  }

  const setFlag = async (project: ProjectListItem, flag: "is_active" | "is_featured", value: boolean) => {
    setItems((current) => current.map((item) => (item.id === project.id ? { ...item, [flag]: value } : item)))
    const message = flag === "is_active" ? (value ? "Shown on the site" : "Hidden from the site") : value ? "Featured" : "No longer featured"
    if ((await runAction(setProjectFlag(project.id, flag, value), message)) === undefined) router.refresh()
  }

  const remove = async (project: ProjectListItem) => {
    if (!(await confirm({ title: `Delete “${project.title}”?`, description: "Its images and files are deleted too.", confirmLabel: "Delete", destructive: true })))
      return
    if ((await runAction(deleteProject(project.id), "Project deleted")) !== undefined) {
      setItems((current) => current.filter((item) => item.id !== project.id))
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <label className="relative block max-w-xs">
        <span className="sr-only">Search projects</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="h-9 rounded-full pl-9" />
      </label>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No projects yet.{" "}
          <Link href="/admin/projects/new" className="text-foreground underline underline-offset-4">
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border [&_li:last-child>div]:border-b-0">
          <SortableList
            items={visible}
            getId={(project) => project.id}
            onReorder={reorder}
            // Reordering a filtered subset would be confusing.
            disabled={terms.length > 0}
            renderItem={(project, handle) => (
              <div className={cn("flex items-center gap-3 border-b bg-card px-3 py-3 sm:px-4", !project.is_active && "text-muted-foreground")}>
                {handle}
                <Link href={`/admin/projects/${project.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="relative hidden h-12 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:block">
                    {project.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of any host
                      <img src={project.image_url} alt="" className={cn("h-full w-full object-cover", !project.is_active && "opacity-50")} />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 truncate font-medium">
                      {project.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
                      {project.title}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{project.description}</span>
                  </span>
                </Link>
                <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                  {project.category && <StatusBadge className="border-border font-normal normal-case text-muted-foreground">{project.category}</StatusBadge>}
                  {project.is_sellable && project.price_inr && (
                    <StatusBadge className="border-brand/30 bg-brand/10 text-brand">{inr.format(project.price_inr)}</StatusBadge>
                  )}
                  {!project.is_active && <StatusBadge className="border-border">Hidden</StatusBadge>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/projects/${project.id}`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFlag(project, "is_active", !project.is_active)}>
                      {project.is_active ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {project.is_active ? "Hide from site" : "Show on site"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFlag(project, "is_featured", !project.is_featured)}>
                      {project.is_featured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                      {project.is_featured ? "Unfeature" : "Feature on home"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => remove(project)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
