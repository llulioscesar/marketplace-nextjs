import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "No autorizado",
};

export default function Page() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">
                        Acceso Denegado
                    </h1>
                    <p className="text-gray-600 mb-4">
                        No tienes permisos para acceder a esta página.
                    </p>
                    <Link href="/" className="text-blue-500 hover:underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    )
}