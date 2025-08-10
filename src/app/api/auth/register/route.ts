import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {PrismaClient} from '@prisma/client';
import {z} from 'zod';
import {registerSchema} from "@/lib/validations/auth";

const prisma = new PrismaClient();

function sanitizeUser(user: any) {
    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword;
}

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
                    /*details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    }))*/
                }, {
                    status: 400,
                });
            }
            throw error;
        }

        const existingUser = await prisma.user.findUnique({
            where: {email: validateData.email},
        });

        if (existingUser) {
            return NextResponse.json({
                error: 'El email ya esta registrado',
                code: 'EMAIL_ALREADY_EXISTS',
                suggestion: 'Intenta iniciar sesion',
            },{
                status: 400,
            });
        }

        const hashedPassword = await bcrypt.hash(validateData.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: validateData.email.toLowerCase(),
                password: hashedPassword,
                name: validateData.name.trim(),
                role: validateData.role,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: sanitizeUser(newUser)
        }, { status: 201 });
    } catch (error) {
        console.error('Error en registro:', error);

        // Error de Prisma
        if (error instanceof Error && error.message.includes('P2002')) {
            return NextResponse.json(
                {
                    error: 'Este email ya está registrado',
                    code: 'EMAIL_ALREADY_EXISTS'
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error: 'Error al procesar el registro. Por favor, intenta nuevamente.',
                code: 'INTERNAL_ERROR'
            },
            { status: 500 }
        );
    }
}