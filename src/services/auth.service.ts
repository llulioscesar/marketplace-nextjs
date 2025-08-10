import { prisma } from '@/lib/db';
import { 
  sanitizeUser, 
  hashPassword, 
  comparePassword, 
  normalizeEmail 
} from '@/lib/utils/auth.utils';
import { 
  SafeUser, 
  LoginCredentials, 
  RegisterData, 
  LoginResult, 
  RegisterResult 
} from '@/types/auth.types';

export class AuthService {

  /**
   * Autentica un usuario con credenciales
   */
  static async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { email, password } = credentials;

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
      });

      if (!user) {
        return { user: null, error: 'Credenciales inválidas' };
      }

      const isValid = await comparePassword(password, user.password);

      if (!isValid) {
        return { user: null, error: 'Credenciales inválidas' };
      }

      return { user: sanitizeUser(user) };
    } catch (error) {
      console.error('Error during login:', error);
      return { user: null, error: 'Error interno del servidor' };
    }
  }

  /**
   * Registra un nuevo usuario
   */
  static async register(data: RegisterData): Promise<RegisterResult> {
    const { email, password, name, role } = data;

    try {
      const normalizedEmail = normalizeEmail(email);
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        return { 
          user: null, 
          error: 'El email ya está registrado' 
        };
      }

      // Hash de la contraseña
      const hashedPassword = await hashPassword(password);

      // Crear usuario
      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name.trim(),
          role,
        }
      });

      return { user: sanitizeUser(newUser) };
    } catch (error) {
      console.error('Error during registration:', error);

      // Error específico de Prisma para duplicados
      if (error instanceof Error && error.message.includes('P2002')) {
        return { 
          user: null, 
          error: 'Este email ya está registrado' 
        };
      }

      return { 
        user: null, 
        error: 'Error al procesar el registro' 
      };
    }
  }

  /**
   * Obtiene un usuario por email
   */
  static async getUserByEmail(email: string): Promise<SafeUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) }
      });

      return user ? sanitizeUser(user) : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getUserById(id: string): Promise<SafeUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      return user ? sanitizeUser(user) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  /**
   * Verifica si un email ya está registrado
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) },
        select: { id: true }
      });

      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   */
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  /**
   * Verifica si la contraseña actual es correcta
   */
  static async verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) return false;

      return await comparePassword(currentPassword, user.password);
    } catch (error) {
      console.error('Error verifying current password:', error);
      return false;
    }
  }
}