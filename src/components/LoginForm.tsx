'use client';

import React, {useEffect, useState} from 'react';
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@components/ui/form";
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {EyeIcon, EyeOffIcon, Loader2Icon} from "lucide-react";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";

const loginSchema = z.object({
    email: z.email('Correo invalido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const router = useRouter();

    const [showPass, setShowPass] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        const {email, password} = data;
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                console.log(result);
                alert(result.error);
                return;
            }

            const response = await fetch('/api/auth/session');
            const session = await response.json();

            if (session?.user?.role === 'BUSINESS') {
                router.push('/dashboard');
            } else if (session?.user?.role === 'CUSTOMER'){
                router.push('/');
            }

        } catch (error: any) {
            alert(error.message);
        }
    }

    return (
        <>
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Correo</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="customer3@test.com" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <div className="flex w-full max-w-sm items-center gap-2">
                                        <Input type={showPass ? 'text' : 'password'} placeholder="********" {...field}/>
                                        <Button type="button" variant="secondary" size="icon" className="size-8"
                                                onClick={() => setShowPass(!showPass)}>
                                            {showPass ? (<EyeOffIcon/>) : (<EyeIcon/>)}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full"
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2Icon className="animate-spin">Iniciando sesión...</Loader2Icon>) : "Iniciar sesión"}
                    </Button>
                </form>
            </Form>

        </>
    )
};