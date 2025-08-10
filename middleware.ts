import {withAuth} from 'next-auth/middleware';
import {NextResponse} from "next/server";

export default withAuth(
    function middleware(request) {
        const token = request.nextauth.token;
        const path = request.nextUrl.pathname;

        if (path.startsWith('/dashboard')) {
            if (token?.role !== 'BUSINESS') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        if (path.startsWith('/checkout') || path.startsWith('/my-orders')) {
            if (token?.role !== 'CUSTOMER') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({token}) => !!token,
        }
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',  // Todas las rutas de business
        '/checkout/:path*',   // Proceso de compra (solo customers)
        '/my-orders/:path*',  // Pedidos del cliente
        '/profile/:path*',    // Perfil (ambos roles pero autenticados)
    ]
};