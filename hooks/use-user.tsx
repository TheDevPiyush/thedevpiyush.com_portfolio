import { useUserStore } from '@/lib/useStore';
import { toast } from 'sonner';

export default function useUser() {
    const { setUser } = useUserStore()

    // Loads the verified profile for the current session (the server creates it on first sign-in).
    const loadUser = async () => {
        const response = await fetch("/api/me", { cache: "no-store" })

        if (response.ok) {
            const data = await response.json()
            setUser(data.user)
        } else if (response.status !== 401) {
            toast.error("Something went wrong! Kindly Refresh the app.")
        }
    }

    return { loadUser }
}
