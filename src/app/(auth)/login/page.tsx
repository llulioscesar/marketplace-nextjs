import type {Metadata} from "next";
import Link from 'next/link'
import { LoginForm } from "@/components/auth";

export const metadata: Metadata = {
    title: "Iniciar sesion",
};

export default function Page() {
    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Inicia sesión en tu cuenta
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <LoginForm/>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        ¿No eres miembro?{' '}
                        <Link href="/register" className="font-semibold">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}