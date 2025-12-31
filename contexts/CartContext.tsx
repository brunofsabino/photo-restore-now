"use client";

/**
 * Shopping Cart Context
 * 
 * Manages cart state with persistence using localStorage + IndexedDB
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, PackageType } from '@/types';
import { PRICING_PACKAGES } from '@/lib/constants';
import { generateId, safeJsonParse } from '@/lib/utils';
import {
  saveFilesToStorage,
  getFilesFromStorage,
  deleteFilesFromStorage,
  clearAllFilesFromStorage,
} from '@/lib/storage';

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
          
          setCart({
            ...parsed,
            items: validItems,
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

  const addToCart = async (packageId: PackageType, images: File[]) => {
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
      images,
      addedAt: new Date(),
    };

    setCart(prev => {
      // Filter out orphaned items
      const validPrevItems = prev.items.filter(item => item.images.length > 0);
      const newItems = [...validPrevItems, newItem];
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

  const clearCart = async () => {
    // Clear files from IndexedDB
    await clearAllFilesFromStorage();
    
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
