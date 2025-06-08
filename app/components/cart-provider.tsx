
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Course } from '@/lib/types';

interface CartItem {
  course: Course;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextType {
  state: CartState;
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  updateQuantity: (courseId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; course: Course }
  | { type: 'REMOVE_FROM_CART'; courseId: string }
  | { type: 'UPDATE_QUANTITY'; courseId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.course.id === action.course.id);
      
      if (existingItem) {
        // Course already in cart, don't add again (courses are typically one-time purchases)
        return state;
      }

      const newItems = [...state.items, { course: action.course, quantity: 1 }];
      const total = newItems.reduce((sum, item) => sum + (item.course.price || 0) * item.quantity, 0);
      
      return { items: newItems, total };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.course.id !== action.courseId);
      const total = newItems.reduce((sum, item) => sum + (item.course.price || 0) * item.quantity, 0);
      
      return { items: newItems, total };
    }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', courseId: action.courseId });
      }

      const newItems = state.items.map(item =>
        item.course.id === action.courseId
          ? { ...item, quantity: action.quantity }
          : item
      );
      const total = newItems.reduce((sum, item) => sum + (item.course.price || 0) * item.quantity, 0);
      
      return { items: newItems, total };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 };

    case 'LOAD_CART': {
      const total = action.items.reduce((sum, item) => sum + (item.course.price || 0) * item.quantity, 0);
      return { items: action.items, total };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', items });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (course: Course) => {
    dispatch({ type: 'ADD_TO_CART', course });
  };

  const removeFromCart = (courseId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', courseId });
  };

  const updateQuantity = (courseId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', courseId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
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
