"use client"

import { useState, type ReactNode } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  getRowId: (row: T) => string
  searchPlaceholder?: string
  /** Text the search box matches against. */
  searchText?: (row: T) => string
  /** Filters, tabs or buttons shown next to the search box. */
  toolbar?: ReactNode
  /** Enables row checkboxes; renders while at least one row is selected. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode
  onRowClick?: (row: T) => void
  initialSorting?: SortingState
  emptyMessage?: ReactNode
  pageSize?: number
}

// Searchable, sortable, paginated table on TanStack Table, with optional selection + bulk actions.
export function DataTable<T>({
  columns,
  data,
  getRowId,
  searchPlaceholder = "Search…",
  searchText,
  toolbar,
  bulkActions,
  onRowClick,
  initialSorting = [],
  emptyMessage = "Nothing to show.",
  pageSize = 25,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selectColumn: ColumnDef<T, unknown> = {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        onClick={(event) => event.stopPropagation()}
        aria-label="Select row"
      />
    ),
  }

  const table = useReactTable({
    data,
    columns: bulkActions ? [selectColumn, ...columns] : columns,
    getRowId,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: Boolean(bulkActions),
    globalFilterFn: (row: Row<T>, _columnId, value: string) => {
      const haystack = (searchText ? searchText(row.original) : JSON.stringify(row.original)).toLowerCase()
      return value
        .toLowerCase()
        .split(/\s+/)
        .every((term) => haystack.includes(term))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: true,
  })

  const selected = table.getSelectedRowModel().rows.map((row) => row.original)
  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex } = table.getState().pagination

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-full pl-9"
          />
        </label>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      {bulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm">
          <span className="mr-2 font-medium">{selected.length} selected</span>
          {bulkActions(selected, () => setRowSelection({}))}
          <button type="button" onClick={() => setRowSelection({})} className="ml-auto text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn("h-10 whitespace-nowrap text-xs", header.column.id === "select" && "w-10")}
                    style={{ width: header.column.columnDef.size !== 150 ? header.column.columnDef.size : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="py-16 text-center text-sm text-muted-foreground">
                  {globalFilter ? "No matches." : emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filteredCount} {filteredCount === 1 ? "row" : "rows"}
        </span>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <span>
              Page {pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Clickable header that cycles the column's sort. */
export function SortHeader<T>({ column, children }: { column: Column<T, unknown>; children: ReactNode }) {
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="-ml-2 inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-muted hover:text-foreground"
    >
      {children}
      <Icon className={cn("h-3 w-3", !sorted && "opacity-40")} />
    </button>
  )
}

/** Segmented control for status filters above a table. */
export function FilterTabs<V extends string>({
  value,
  onChange,
  options,
}: {
  value: V
  onChange: (value: V) => void
  options: { value: V; label: string; count?: number }[]
}) {
  return (
    <div className="inline-flex rounded-full border p-0.5 text-sm" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors",
            value === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && <span className="text-xs opacity-60">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}
