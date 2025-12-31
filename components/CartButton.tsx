'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/constants';

export function CartButton() {
  const { cart } = useCart();
  const itemCount = cart.items.length;
  const totalImages = cart.totalImages;

  return (
    <Link 
      href={APP_ROUTES.CHECKOUT}
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
    >
      <ShoppingCart className="h-5 w-5 text-gray-700" />
      {itemCount > 0 && (
        <>
          <span className="absolute -top-1 right-0 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
          <span className="hidden sm:inline text-sm text-gray-600">
            {totalImages} {totalImages === 1 ? 'photo' : 'photos'}
          </span>
        </>
      )}
    </Link>
  );
}
