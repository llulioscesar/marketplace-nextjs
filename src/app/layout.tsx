import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/providers";
import {Toaster} from "@/components/ui/sonner";
import { AppLayout } from "@/components/layouts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Marketplace básico - Encuentra productos de diferentes tiendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Providers>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster/>
      </Providers>
      </body>
    </html>
  );
}
