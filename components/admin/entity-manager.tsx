"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminPageHeader } from "./page-header"
import { SortableList } from "./sortable-list"
import { TagInput } from "./tag-input"
import { confirm } from "./confirm-dialog"
import { ENTITIES, toFormValues, type EntityConfig, type EntityKey, type FieldConfig } from "@/lib/admin/entities"
import { runAction } from "@/lib/admin/run-action"
import { deleteEntity, reorderEntities, saveEntity, setEntityActive } from "@/app/admin/_actions/entities"
import { cn } from "@/lib/utils"

type Row = Record<string, unknown> & { id: string }

// List + slide-over form for the simple sections (experience, skills, …), driven by lib/admin/entities.ts.
export function EntityManager({ entity, rows }: { entity: EntityKey; rows: Row[] }) {
  const config: EntityConfig = ENTITIES[entity]
  const router = useRouter()
  const [items, setItems] = useState(rows)
  const [editing, setEditing] = useState<Row | "new" | null>(null)

  useEffect(() => setItems(rows), [rows])

  // Values already used in a column, offered as suggestions (e.g. skill categories).
  const suggestions = Object.fromEntries(
    config.fields
      .filter((field) => field.suggest)
      .map((field) => [field.name, [...new Set(items.map((item) => item[field.name]).filter(Boolean) as string[])].sort()]),
  )

  const reorder = async (next: Row[]) => {
    const previous = items
    setItems(next)
    const ok = await runAction(reorderEntities(entity, next.map((item) => item.id)))
    if (ok === undefined) setItems(previous)
  }

  const toggleActive = async (row: Row, isActive: boolean) => {
    setItems((current) => current.map((item) => (item.id === row.id ? { ...item, is_active: isActive } : item)))
    const ok = await runAction(setEntityActive(entity, row.id, isActive), isActive ? "Shown on the site" : "Hidden from the site")
    if (ok === undefined) router.refresh()
  }

  const remove = async (row: Row) => {
    const { primary } = config.summary(row)
    if (!(await confirm({ title: `Delete “${primary}”?`, description: "This can't be undone.", confirmLabel: "Delete", destructive: true })))
      return
    const ok = await runAction(deleteEntity(entity, row.id), "Deleted")
    if (ok !== undefined) {
      setItems((current) => current.filter((item) => item.id !== row.id))
      router.refresh()
    }
  }

  const renderRow = (row: Row, handle?: React.ReactNode) => {
    const { primary, secondary, meta } = config.summary(row)
    return (
      <div className={cn("flex items-center gap-3 border-b bg-card px-3 py-3 sm:px-4", !row.is_active && "text-muted-foreground")}>
        {handle}
        <button type="button" onClick={() => setEditing(row)} className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium">{primary}</p>
          {secondary && <p className="truncate text-sm text-muted-foreground">{secondary}</p>}
        </button>
        {meta && <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{meta}</span>}
        {!row.is_active && <Badge variant="outline" className="hidden sm:inline-flex">Hidden</Badge>}
        <Switch
          checked={Boolean(row.is_active)}
          onCheckedChange={(checked) => toggleActive(row, checked)}
          aria-label={row.is_active ? "Hide from site" : "Show on site"}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditing(row)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => remove(row)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={config.title}
        description={
          <>
            {config.description}
            {config.sortable && items.length > 1 && " Drag rows to change the order."}
          </>
        }
        actions={
          <Button variant="brand" size="pill-sm" onClick={() => setEditing("new")}>
            <Plus /> Add {config.singular}
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nothing here yet.{" "}
          <button type="button" onClick={() => setEditing("new")} className="text-foreground underline underline-offset-4">
            Add the first {config.singular}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border [&_li:last-child>div]:border-b-0">
          {config.sortable ? (
            <SortableList items={items} getId={(item) => item.id} onReorder={reorder} renderItem={renderRow} />
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>{renderRow(item)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          {editing !== null && (
            <EntityForm
              key={editing === "new" ? "new" : editing.id}
              entity={entity}
              row={editing === "new" ? undefined : editing}
              suggestions={suggestions}
              onSaved={(row, isNew) => {
                setItems((current) => (isNew ? [...current, row] : current.map((item) => (item.id === row.id ? row : item))))
                setEditing(null)
                router.refresh()
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EntityForm({
  entity,
  row,
  suggestions,
  onSaved,
  onCancel,
}: {
  entity: EntityKey
  row?: Row
  suggestions: Record<string, string[]>
  onSaved: (row: Row, isNew: boolean) => void
  onCancel: () => void
}) {
  const config: EntityConfig = ENTITIES[entity]
  const form = useForm<Record<string, unknown>>({
    // raw: submit the form values as typed; the server action parses them with the same schema.
    resolver: zodResolver(config.schema, undefined, { raw: true }),
    defaultValues: toFormValues(config, row),
  })
  const { isSubmitting, errors } = form.formState

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await runAction(saveEntity(entity, row?.id ?? null, values), row ? "Saved" : `${config.singular[0].toUpperCase()}${config.singular.slice(1)} added`)
    if (saved) onSaved(saved as Row, !row)
  })

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="border-b px-6 py-5 text-left">
        <SheetTitle>{row ? `Edit ${config.singular}` : `New ${config.singular}`}</SheetTitle>
        <SheetDescription>{config.title}</SheetDescription>
      </SheetHeader>

      <div className="grid flex-1 grid-cols-2 content-start gap-x-4 gap-y-5 overflow-y-auto px-6 py-6">
        {config.fields.map((field) => (
          <FieldRow key={field.name} field={field} error={errors[field.name]?.message as string | undefined}>
            {field.type === "switch" ? (
              <Controller
                control={form.control}
                name={field.name}
                render={({ field: input }) => (
                  <Switch id={field.name} checked={Boolean(input.value)} onCheckedChange={input.onChange} />
                )}
              />
            ) : field.type === "tags" ? (
              <Controller
                control={form.control}
                name={field.name}
                render={({ field: input }) => (
                  <TagInput
                    id={field.name}
                    value={(input.value as string[]) ?? []}
                    onChange={input.onChange}
                    placeholder={field.placeholder}
                  />
                )}
              />
            ) : field.type === "textarea" || field.type === "lines" ? (
              <Textarea id={field.name} rows={field.type === "lines" ? 5 : 4} placeholder={field.placeholder} {...form.register(field.name)} />
            ) : (
              <>
                <Input
                  id={field.name}
                  type={field.type === "url" ? "url" : field.type}
                  placeholder={field.placeholder}
                  list={field.suggest ? `${field.name}-suggestions` : undefined}
                  {...form.register(field.name)}
                />
                {field.suggest && (
                  <datalist id={`${field.name}-suggestions`}>
                    {(suggestions[field.name] ?? []).map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </>
            )}
          </FieldRow>
        ))}
      </div>

      <SheetFooter className="gap-2 border-t px-6 py-4">
        <Button type="button" variant="outline" size="pill-sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" size="pill-sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {row ? "Save changes" : `Add ${config.singular}`}
        </Button>
      </SheetFooter>
    </form>
  )
}

function FieldRow({ field, error, children }: { field: FieldConfig; error?: string; children: React.ReactNode }) {
  const inline = field.type === "switch"
  return (
    <div className={cn("space-y-2", field.half ? "col-span-2 sm:col-span-1" : "col-span-2", inline && "flex items-center justify-between gap-4 space-y-0 self-end rounded-lg border px-3 py-2.5")}>
      <Label htmlFor={field.name} className={cn(inline && "font-normal")}>
        {field.label}
      </Label>
      {children}
      {field.description && !inline && <p className="text-xs text-muted-foreground">{field.description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
