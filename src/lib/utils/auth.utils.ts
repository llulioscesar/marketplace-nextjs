import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { SafeUser } from '@/types/auth.types';

/**
 * Remueve la contraseña del objeto usuario para retornarlo de forma segura
 */
export function sanitizeUser(user: User): SafeUser {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Genera un hash de la contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Compara una contraseña en texto plano con su hash
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Valida el formato de email (básica)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza email a lowercase y trim
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Valida longitud mínima de contraseña
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}