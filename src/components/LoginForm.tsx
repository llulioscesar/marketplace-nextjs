'use client';

import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@components/ui/form";
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {EyeIcon, EyeOffIcon, Loader2Icon} from "lucide-react";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {LoginInput, loginSchema} from "@/lib/validations/auth";

export default function LoginForm() {
    const router = useRouter();

    const [showPass, setShowPass] = useState(false);

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: LoginInput) => {
        const {email, password} = data;
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                console.error(result);
                if (result.error === 'CredentialsSignin') {
                    toast.error('Email o contraseña incorrectos', {
                        position: 'top-center',
                        richColors: true,
                    });
                    form.reset({...data, password: ''})
                    return;
                }

                toast.error(result.error, {
                    position: 'top-center',
                    richColors: true,
                });
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
            toast.error(error.message, {
                position: 'top-center',
                richColors: true,
            });
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