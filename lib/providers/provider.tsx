'use client';

import { ProgressProvider } from '@bprogress/next/app';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { supabaseBrowser } from '../supabase/browser';
import useUser from '@/hooks/use-user';
import { useUserStore } from '../useStore';

const Providers = ({ children }: { children: React.ReactNode }) => {
    const { loadUser } = useUser();
    const clearUser = useUserStore((state) => state.clearUser);
    const setAuthLoading = useUserStore((state) => state.setAuthLoading);

    useEffect(() => {
        // Fires INITIAL_SESSION on mount, then on every sign-in/sign-out/refresh.
        const { data: authListener } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                clearUser();
                setAuthLoading(false);
                return;
            }

            // Defer the fetch out of the auth callback, as Supabase recommends.
            setTimeout(async () => {
                await loadUser();
                setAuthLoading(false);
            }, 0);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <ProgressProvider
            height="2px"
            color="hsl(var(--brand))"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
            <Toaster position="bottom-center" />
        </ProgressProvider>
    );
};

export default Providers;
