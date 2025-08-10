import {z} from 'zod';
import validator from 'validator';

export const UserRole = z.enum(['CUSTOMER', 'BUSINESS']);

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres');
    /*.regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial');*/

export const registerSchema = z.object({
    email: z.email('Email invalido')
        .toLowerCase()
        .trim()
        .refine((email) => validator.isEmail(email), {
            error: 'Formato de email invalido',
        }),

    password: passwordSchema,

    confirmPassword: z.string(),

    name: z.string()
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),

    role: UserRole,
}).refine((data) => data.password === data.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});


export const loginSchema = z.object({
    email: z.email('Email invalido')
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(1, 'La contraseña es requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;