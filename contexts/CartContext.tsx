"use client";

/**
 * Shopping Cart Context
 * 
 * Manages cart state with persistence using localStorage + IndexedDB
 * Automatically clears cart when user logs out
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Cart, CartItem, PackageType, ServiceType } from '@/types';
import { PRICING_PACKAGES } from '@/lib/constants';
import { generateId, safeJsonParse, calculateServicePrice } from '@/lib/utils';
import {
  saveFilesToStorage,
  getFilesFromStorage,
  deleteFilesFromStorage,
  clearAllFilesFromStorage,
} from '@/lib/storage';

interface CartContextType {
  cart: Cart;
  addToCart: (packageId: PackageType, serviceType: ServiceType, images: File[]) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'photo-restore-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const previousSessionRef = useRef<string | null>(null);
  
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalAmount: 0,
    totalImages: 0,
  });

  // Define clearCart with useCallback first
  const clearCart = useCallback(async () => {
    console.log('Clearing cart...');
    // Clear files from IndexedDB
    await clearAllFilesFromStorage();
    
    setCart({
      items: [],
      totalAmount: 0,
      totalImages: 0,
    });
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // Monitor session changes to detect logout
  useEffect(() => {
    if (status === 'loading') return;

    const currentUserId = session?.user?.id || null;
    const previousUserId = previousSessionRef.current;

    // User logged out (was logged in, now not)
    if (previousUserId && !currentUserId) {
      console.log('User logged out - clearing cart');
      clearCart();
    }

    // Update ref with current session
    previousSessionRef.current = currentUserId;
  }, [session, status, clearCart]);

  // Load cart from localStorage + IndexedDB on mount
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          
          // Restore files from IndexedDB
          const itemsWithFiles = await Promise.all(
            parsed.items.map(async (item: any) => {
              const files = await getFilesFromStorage(item.id);
              return {
                ...item,
                images: files,
              };
            })
          );
          
          // Filter out items without images (orphaned items)
          const validItems = itemsWithFiles.filter((item: CartItem) => item.images.length > 0);
          
          if (validItems.length !== itemsWithFiles.length) {
            console.log('Removed orphaned cart items without images');
          }
          
          // Recalculate total amount based on current pricing (handles price updates)
          const totalAmount = validItems.reduce((sum, item) => {
            const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
            return sum + calculateServicePrice(pkg?.basePrice || 0, item.serviceType);
          }, 0);
          
          setCart({
            ...parsed,
            items: validItems,
            totalAmount,
            totalImages: validItems.reduce((sum, item) => sum + item.images.length, 0),
          });
        } catch (e) {
          console.error('Failed to load cart:', e);
        }
      }
    };
    
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes (without files)
  useEffect(() => {
    const cartToSave = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        images: [], // Don't save File objects to localStorage
        imageCount: item.images.length, // Save count instead
      })),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
  }, [cart]);

  const addToCart = async (packageId: PackageType, serviceType: ServiceType, images: File[]) => {
    const packageInfo = PRICING_PACKAGES.find(p => p.id === packageId);
    if (!packageInfo) return;

    // Check for orphaned items (items without images)
    const hasOrphanedItems = cart.items.some(item => item.images.length === 0);
    
    if (hasOrphanedItems) {
      // Clean up orphaned items before adding new one
      const validItems = cart.items.filter(item => item.images.length > 0);
      if (validItems.length === 0) {
        // If all items are orphaned, just clear everything
        await clearAllFilesFromStorage();
      } else {
        // Remove only orphaned items from IndexedDB
        await Promise.all(
          cart.items
            .filter(item => item.images.length === 0)
            .map(item => deleteFilesFromStorage(item.id))
        );
      }
    }

    const newItemId = generateId();
    
    // Store files in IndexedDB
    await saveFilesToStorage(newItemId, images);

    const newItem: CartItem = {
      id: newItemId,
      packageId,
      serviceType,
      images,
      addedAt: new Date(),
    };

    setCart(prev => {
      // Filter out orphaned items
      const validPrevItems = prev.items.filter(item => item.images.length > 0);
      const newItems = [...validPrevItems, newItem];
      const totalAmount = newItems.reduce((sum, item) => {
        const pkg = PRICING_PACKAGES.find(p => p.id === item.packageId);
        return sum + calculateServicePrice(pkg?.basePrice || 0, item.serviceType);
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

  const removeFromCart = async (itemId: string) => {
    // Remove files from IndexedDB
    await deleteFilesFromStorage(itemId);
    
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
