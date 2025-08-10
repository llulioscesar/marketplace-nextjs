'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/components/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                {children}
            </QueryProvider>
        </SessionProvider>
    );
}