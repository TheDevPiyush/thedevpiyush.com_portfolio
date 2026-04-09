import { create } from 'zustand'

interface User {
    id: string,
    email: string,
    isAdmin: Boolean,
    isAuthLoading: boolean,
    setUser: (user: Pick<User, "id" | "email" | "isAdmin">) => void
    setAuthLoading: (isLoading: boolean) => void
    clearUser: () => void
}

export const useUserStore = create<User>((set) => ({
    id: "",
    email: "",
    isAdmin: false,
    isAuthLoading: true,
    setUser: (user) => set(user),
    setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
    clearUser: () => set({ isAdmin: false, email: "", id: "" })
}))