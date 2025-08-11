import {useSession} from "next-auth/react";
import { useMutation } from '@tanstack/react-query';
import { RegisterInput } from '@/lib/validations/auth';

export function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        isCustomer: session?.user?.role === 'CUSTOMER',
        isBusiness: session?.user?.role === 'BUSINESS'
    }
}

export function useRegister() {
    return useMutation({
        mutationFn: async (data: RegisterInput) => {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al registrar usuario');
            }

            return result;
        }
    });
}