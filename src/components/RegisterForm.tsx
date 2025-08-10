'use client';

import React, {useState} from 'react';
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {EyeIcon, EyeOffIcon, Loader2Icon} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@components/ui/form";
import {RadioGroup, RadioGroupItem} from "@components/ui/radio-group";
import {RegisterInput, registerSchema} from "@/lib/validations/auth";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function RegisterForm() {
    const [showPass, setShowPass] = useState(false);
    const router = useRouter()

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            role: undefined,
        }
    });

    const onSubmit = async (validatedData: RegisterInput) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData),
            })

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'EMAIL_ALREADY_EXISTS') {
                    toast('Este email ya esta registrado', {
                        position: 'top-center'
                    });
                } else if (data.details) {

                } else {
                    toast(data.error || 'Error al registrar', {
                        position: 'top-center'
                    });
                }
                return;
            }

            toast('Registro exitoso', {
                position: 'top-center'
            })
            router.push('/login');
        } catch (error) {
            console.error(error);
            toast('Error inesperado. Por favor, intenta nuevamente.', {
                position: 'top-center'
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
                                    <Input type="email" autoComplete="off" placeholder="customer3@test.com" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input type="text" autoComplete="off" placeholder="Customer 3" {...field}/>
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
                                        <Input type={showPass ? 'text' : 'password'} autoComplete="off"
                                               placeholder="********" {...field}/>
                                        <Button type="button" variant="secondary" size="icon" className="size-8"
                                                onClick={() => setShowPass(!showPass)}>
                                            {showPass ? (<EyeOffIcon/>) : (<EyeIcon/>)}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Confirmar Contraseña</FormLabel>
                                <FormControl>
                                    <div className="flex w-full max-w-sm items-center gap-2">
                                        <Input type={showPass ? 'text' : 'password'} autoComplete="off"
                                               placeholder="********" {...field}/>
                                        <Button type="button" variant="secondary" size="icon" className="size-8"
                                                onClick={() => setShowPass(!showPass)}>
                                            {showPass ? (<EyeOffIcon/>) : (<EyeIcon/>)}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>

                    <FormField
                        control={form.control}
                        name="role"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Tipo de cuenta</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <div className="flex">
                                            <div className="flex items-center me-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="CUSTOMER" id="customer"/>
                                                    <label htmlFor="cliente">Cliente</label>
                                                </div>
                                            </div>
                                            <div className="flex items-center me-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="BUSINESS" id="business"/>
                                                    <label htmlFor="business">Business</label>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full"
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2Icon className="animate-spin">Creando cuenta...</Loader2Icon>) : "Crear cuenta"}
                    </Button>
                </form>
            </Form>
        </>
    )
};