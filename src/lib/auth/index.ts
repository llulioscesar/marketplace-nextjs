export { authOptions } from './config';
export { 
  getAuthSession, 
  isAuthenticated, 
  getCurrentUser, 
  hasRole, 
  isBusiness, 
  isCustomer 
} from './server';

// Re-export tipos útiles de NextAuth
export type { NextAuthOptions, Session, User } from 'next-auth';
export type { JWT } from 'next-auth/jwt';