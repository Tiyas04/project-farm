"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // the database CartItem _id or Product _id. The backend uses productid to match.
  name: string;
  price: number;
  quantity: number;
  image?: string;
  cartItemId?: string; // The specific CartItemsModel _id
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to trigger login modal
  const triggerLogin = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('require-auth', { detail: 'login' }));
    }
  };

  // Fetch Cart from Backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/cart', { method: 'GET' });
        
        if (res.ok) {
          const json = await res.json();
          // Map backend CartItems list to frontend context shape
          if (json.data && Array.isArray(json.data)) {
            const loadedItems: CartItem[] = json.data
              .filter((item: any) => item.productid) // Ensure product exists
              .map((item: any) => ({
                id: item.productid._id, // we use product ID as the main reference for UI logic
                cartItemId: item._id, // backend specific cart item ID
                name: item.productid.name || 'Unknown Product',
                price: item.price || item.productid.price || 0,
                quantity: item.quantity,
                image: item.productid.image || undefined, // mapping exactly to schema
              }));
            setCartItems(loadedItems);
          }
        }
      } catch (error) {
        console.error("Failed to fetch cart", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (product: CartItem) => {
    // Optimistic UI approach for snappiness, but if it fails we revert.
    // However, if we need to enforce Login Modal, we shouldn't optimistically add if unauthenticated.
    // We will await the request and only update state on success.
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.status === 401) {
        triggerLogin();
        return;
      }

      if (res.ok) {
        // Find if already exists in state
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          }
          return [...prevItems, { ...product, quantity: product.quantity || 1 }];
        });
      } else {
        const json = await res.json();
        alert(json.message || "Failed to add to cart");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        triggerLogin();
        return;
      }
      if (res.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        alert("Failed to remove item");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    // Optistic UI update for quantity since it's commonly clicked rapidly
    setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity } : item));

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.status === 401) {
        triggerLogin();
        // Revert UI? Ignoring to keep it simple, they should login anyway
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Failed to update stock");
        // Opt: Revert optimistic update here by re-fetching cart, left simple for now
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
