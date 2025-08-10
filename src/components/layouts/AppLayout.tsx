'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Páginas donde NO mostrar la navegación
  const authPages = ['/login', '/register'];
  const shouldShowNavigation = !authPages.includes(pathname);

  return (
    <>
      {shouldShowNavigation && <Navigation />}
      {children}
    </>
  );
}