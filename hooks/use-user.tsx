import { useUserStore } from '@/lib/useStore';
import { toast } from 'sonner';

export default function useUser() {
    const { setUser } = useUserStore()
    const getOrRegisterUser = async (email: string, id: string) => {
        const response = await fetch("/api/get-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        })

        if (response.ok) {
            const data = await response.json()
            setUser(data?.data[0]);
        }

        else {
            const response = await fetch("/api/register-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email, id: id })
            })
            if (response.ok) {
                const data = await response.json()
                setUser(data?.data[0]);
                toast.success("User registered successfully")
            } else {
                toast.error("Something went wrong! Kindly Refresh the app.")
            }
        }
    }

    return { getOrRegisterUser }
}

