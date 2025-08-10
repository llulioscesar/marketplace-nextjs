import {useSession} from "next-auth/react";

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