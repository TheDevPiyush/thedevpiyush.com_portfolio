'use client';

import { ProgressProvider } from '@bprogress/next/app';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { supabase } from '../supabase/client';
import useUser from '@/hooks/use-user';
import Cookies from 'js-cookie';
import { useUserStore } from '../useStore';

const Providers = ({ children }: { children: React.ReactNode }) => {
    const { getOrRegisterUser } = useUser();
    const setUser = useUserStore((state) => state.setUser);
    const clearUser = useUserStore((state) => state.clearUser);
    const setAuthLoading = useUserStore((state) => state.setAuthLoading);

    useEffect(() => {
        checkAuth();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) {
                Cookies.remove("token");
                clearUser();
                setAuthLoading(false);
                return;
            }

            setUser({
                id: session.user.id,
                email: session.user.email || "",
                isAdmin: false,
            });
            Cookies.set("token", session.access_token || "", { expires: 1 });
            await getOrRegisterUser(session.user.email as string, session.user.id as string);
            setAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        setAuthLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error(error);
        }
        if (!data?.session) {
            setAuthLoading(false);
            return;
        }

        setUser({
            id: data.session.user.id,
            email: data.session.user.email || "",
            isAdmin: false,
        });
        getOrRegisterUser(data.session.user.email as string, data.session.user.id as string);
        Cookies.set("token", data.session.access_token || "", { expires: 1 });
        setAuthLoading(false);
    }

    return (
        <ProgressProvider
            height="4px"
            color="rgb(var(--color-primary))"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
            <Toaster />
        </ProgressProvider>
    );
};

export default Providers;