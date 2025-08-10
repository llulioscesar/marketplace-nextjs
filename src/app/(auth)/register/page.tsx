import type {Metadata} from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms";

export const metadata: Metadata = {
    title: "Crear cuenta",
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
                        Crea tu cuenta
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <RegisterForm/>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="font-semibold">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}