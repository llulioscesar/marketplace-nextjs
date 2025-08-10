'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { CartSessionProvider } from '@/components/providers/CartSessionProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                <CartSessionProvider>
                    {children}
                </CartSessionProvider>
            </QueryProvider>
        </SessionProvider>
    );
}