"use client";

/**
 * Shopping Cart Context
 * 
 * Manages cart state with persistence using localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, PackageType } from '@/types';
import { PRICING_PACKAGES } from '@/lib/constants';
import { generateId, safeJsonParse } from '@/lib/utils';

interface CartContextType {
  cart: Cart;
  addToCart: (packageId: PackageType, images: File[]) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'photo-restore-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalAmount: 0,
    totalImages: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsed = safeJsonParse<Cart>(savedCart, {
        items: [],
        totalAmount: 0,
        totalImages: 0,
      });
      setCart(parsed);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (packageId: PackageType, images: File[]) => {
    const packageInfo = PRICING_PACKAGES.find(p => p.id === packageId);
    if (!packageInfo) return;

    const newItem: CartItem = {
      id: generateId(),
      packageId,
      images,
      addedAt: new Date(),
    };

    setCart(prev => {
      const newItems = [...prev.items, newItem];
      const totalAmount = newItems.reduce((sum, item) => {
        const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
        return sum + (pkg?.price || 0);
      }, 0);
      const totalImages = newItems.reduce(
        (sum, item) => sum + item.images.length,
        0
      );

      return {
        items: newItems,
        totalAmount,
        totalImages,
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const totalAmount = newItems.reduce((sum, item) => {
        const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
        return sum + (pkg?.price || 0);
      }, 0);
      const totalImages = newItems.reduce(
        (sum, item) => sum + item.images.length,
        0
      );

      return {
        items: newItems,
        totalAmount,
        totalImages,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalAmount: 0,
      totalImages: 0,
    });
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotalAmount = () => cart.totalAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
