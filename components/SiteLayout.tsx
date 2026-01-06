'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/constants';
import { CartButton } from '@/components/CartButton';
import { User, LogOut } from 'lucide-react';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            PhotoRestoreNow
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href={APP_ROUTES.PRICING} className="text-gray-600 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            {status === 'authenticated' && (
              <Link href={APP_ROUTES.DASHBOARD} className="text-gray-600 hover:text-primary transition-colors font-medium">
                My Photos
              </Link>
            )}
            <Link href="/#examples" className="text-gray-600 hover:text-primary transition-colors font-medium">
              Examples
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-primary transition-colors font-medium">
              How It Works
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <CartButton />
            {status === 'authenticated' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-800">
                    Hello, {session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href={APP_ROUTES.PRICING}>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PhotoRestoreNow</h3>
              <p className="text-gray-400">
                Professional AI-powered photo restoration service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={APP_ROUTES.PRICING} className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={APP_ROUTES.DASHBOARD} className="text-gray-400 hover:text-white transition-colors">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={APP_ROUTES.PRIVACY} className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={APP_ROUTES.TERMS} className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
