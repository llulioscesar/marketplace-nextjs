import { getServerSession } from "next-auth/next";
import { authOptions } from "./config";
import type { Session } from "next-auth";

/**
 * Obtiene la sesión del usuario en el servidor
 * Útil para Server Components y API Routes
 */
export async function getAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.user;
}

/**
 * Obtiene el usuario actual de la sesión
 */
export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getAuthSession();
  return session?.user?.role === role;
}

/**
 * Verifica si el usuario es un negocio (BUSINESS)
 */
export async function isBusiness(): Promise<boolean> {
  return await hasRole('BUSINESS');
}

/**
 * Verifica si el usuario es un cliente (CUSTOMER)
 */
export async function isCustomer(): Promise<boolean> {
  return await hasRole('CUSTOMER');
}