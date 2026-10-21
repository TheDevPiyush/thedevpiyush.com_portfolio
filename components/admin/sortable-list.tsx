"use client"

import type { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToParentElement } from "./dnd-modifiers"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableListProps<T> {
  items: T[]
  getId: (item: T) => string
  onReorder: (items: T[]) => void
  renderItem: (item: T, handle: ReactNode) => ReactNode
  /** "grid" for image galleries. */
  layout?: "list" | "grid"
  className?: string
  disabled?: boolean
}

// Drag-to-reorder with mouse, touch or keyboard (focus the handle, Space, arrows, Space).
export function SortableList<T>({ items, getId, onReorder, renderItem, layout = "list", className, disabled }: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => getId(item) === active.id)
    const to = items.findIndex((item) => getId(item) === over.id)
    if (from !== -1 && to !== -1) onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToParentElement]}>
      <SortableContext items={items.map(getId)} strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item) => (
            <SortableItem key={getId(item)} id={getId(item)} disabled={disabled}>
              {(handle) => renderItem(item, handle)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({ id, disabled, children }: { id: string; disabled?: boolean; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      disabled={disabled}
      className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-80 shadow-lg")}
    >
      {children(handle)}
    </li>
  )
}
