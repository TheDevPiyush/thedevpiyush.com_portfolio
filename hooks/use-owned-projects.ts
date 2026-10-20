"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { useUserStore } from "@/lib/useStore"

interface OwnedProjectsState {
  userId: string | null
  ids: Set<string>
  markOwned: (projectId: string) => void
}

const useOwnedStore = create<OwnedProjectsState>((set) => ({
  userId: null,
  ids: new Set(),
  markOwned: (projectId) => set((state) => ({ ids: new Set(state.ids).add(projectId) })),
}))

let inflight: Promise<void> | null = null

// Project ids the signed-in user already paid for. Fetched once per user and shared by every buy button.
export function useOwnedProjects() {
  const userId = useUserStore((state) => state.id)
  const { ids, markOwned } = useOwnedStore()

  useEffect(() => {
    if (!userId) {
      useOwnedStore.setState({ userId: null, ids: new Set() })
      return
    }
    if (useOwnedStore.getState().userId === userId || inflight) return

    inflight = fetch("/api/purchases")
      .then((response) => (response.ok ? response.json() : { projectIds: [] }))
      .then(({ projectIds }: { projectIds: string[] }) => {
        useOwnedStore.setState({ userId, ids: new Set(projectIds) })
      })
      .catch(() => {})
      .finally(() => {
        inflight = null
      })
  }, [userId])

  return { owned: ids, markOwned }
}
