import { User, UserRole } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: SafeUser;
}

export interface LoginResult {
  user: SafeUser | null;
  error?: string;
}

export interface RegisterResult {
  user: SafeUser | null;
  error?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}