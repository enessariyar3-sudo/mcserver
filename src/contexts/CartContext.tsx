import React, { createContext, useContext } from 'react';
import { useCartDatabase } from '@/hooks/useCartDatabase';

// Legacy interface for compatibility (now maps to database structure)
interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  quantity: number;
}

// Context type definition
interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider props interface
interface CartProviderProps {
  children: React.ReactNode;
}

// Cart provider component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const {
    items: dbItems,
    loading,
    addToCart: dbAddToCart,
    removeFromCart: dbRemoveFromCart,
    updateQuantity: dbUpdateQuantity,
    clearCart: dbClearCart,
    getTotalPrice,
    getItemCount,
  } = useCartDatabase();

  // Transform database items to match legacy interface
  const items: CartItem[] = dbItems.map(item => ({
    id: item.id,
    name: item.product_name,
    price: item.product_price,
    category: item.product_category,
    image: item.product_image,
    quantity: item.quantity,
  }));

  // Wrapper functions to transform legacy interface to database format
  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    await dbAddToCart({
      product_name: item.name,
      product_price: item.price,
      product_category: item.category,
      product_image: item.image,
    });
  };

  const removeFromCart = async (id: string) => {
    await dbRemoveFromCart(id);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    await dbUpdateQuantity(id, quantity);
  };

  const clearCart = async () => {
    await dbClearCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};