import type { Modifier } from "@dnd-kit/core"

// Keeps a dragged item inside its list (the same as @dnd-kit/modifiers' restrictToParentElement).
export const restrictToParentElement: Modifier = ({ containerNodeRect, draggingNodeRect, transform }) => {
  if (!draggingNodeRect || !containerNodeRect) return transform
  const value = { ...transform }
  if (draggingNodeRect.top + transform.y <= containerNodeRect.top) value.y = containerNodeRect.top - draggingNodeRect.top
  else if (draggingNodeRect.bottom + transform.y >= containerNodeRect.top + containerNodeRect.height)
    value.y = containerNodeRect.top + containerNodeRect.height - draggingNodeRect.bottom
  if (draggingNodeRect.left + transform.x <= containerNodeRect.left) value.x = containerNodeRect.left - draggingNodeRect.left
  else if (draggingNodeRect.right + transform.x >= containerNodeRect.left + containerNodeRect.width)
    value.x = containerNodeRect.left + containerNodeRect.width - draggingNodeRect.right
  return value
}
