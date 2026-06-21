import { createContext, useContext, useState, ReactNode } from "react";
import { Tour } from "./data";

export interface CartItem {
  id: string;
  tour: Tour;
  date: string;
  travelers: number;
}

interface CartContextProps {
  items: CartItem[];
  addToCart: (tour: Tour, date: string, travelers: number) => void;
  removeFromCart: (id: string) => void;
  updateTravelers: (id: string, travelers: number) => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (tour: Tour, date: string, travelers: number) => {
    if (!date) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), tour, date, travelers }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTravelers = (id: string, travelers: number) => {
    if (travelers < 1) return;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, travelers } : item));
  };

  const total = items.reduce((sum, item) => sum + item.tour.price * item.travelers, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateTravelers, total, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
