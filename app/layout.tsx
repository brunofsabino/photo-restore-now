import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import AuthSessionProvider from "./providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhotoRestoreNow - AI-Powered Photo Restoration",
  description: "Bring your old photos back to life with advanced AI technology. Professional photo restoration service for vintage and damaged photographs.",
  keywords: ["photo restoration", "old photo repair", "vintage photos", "AI photo enhancement"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
