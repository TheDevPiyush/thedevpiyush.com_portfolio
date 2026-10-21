"use client"

import { create } from "zustand"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
}

const useConfirmStore = create<{
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
}>(() => ({ options: null, resolve: null }))

/** `if (await confirm({ title: "Delete?" })) …` — rendered by <ConfirmDialogHost /> in the admin layout. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.setState({ options, resolve }))
}

export function ConfirmDialogHost() {
  const { options, resolve } = useConfirmStore()

  const close = (value: boolean) => {
    resolve?.(value)
    useConfirmStore.setState({ options: null, resolve: null })
  }

  return (
    <AlertDialog open={Boolean(options)} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            className={options?.destructive ? buttonVariants({ variant: "destructive" }) : undefined}
          >
            {options?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
