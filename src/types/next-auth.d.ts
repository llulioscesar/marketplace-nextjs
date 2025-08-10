import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        role: 'CUSTOMER' | 'BUSINESS';
    }

    interface Session {
        user: {
            id: string;
            role: 'CUSTOMER' | 'BUSINESS';
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'CUSTOMER' | 'BUSINESS';
    }
}