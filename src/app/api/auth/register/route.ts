import {NextRequest, NextResponse} from "next/server";
import {z} from 'zod';
import {registerSchema} from "@/lib/validations/auth";
import { AuthService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        let validateData;
        try {
            validateData = registerSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.log(error);
                return NextResponse.json({
                    error: 'Datos de registro invalidos',
                    code: 'VALIDATION_ERROR',
                }, {
                    status: 400,
                });
            }
            throw error;
        }

        const result = await AuthService.register(validateData);

        if (result.error) {
            return NextResponse.json({
                error: result.error,
                code: result.error.includes('registrado') ? 'EMAIL_ALREADY_EXISTS' : 'REGISTRATION_ERROR',
                suggestion: result.error.includes('registrado') ? 'Intenta iniciar sesion' : undefined,
            }, {
                status: result.error.includes('registrado') ? 409 : 400,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: result.user
        }, { status: 201 });
    } catch (error) {
        console.error('Error en registro:', error);

        return NextResponse.json(
            {
                error: 'Error al procesar el registro. Por favor, intenta nuevamente.',
                code: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}