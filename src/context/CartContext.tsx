import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tour } from "../data/data";

export type Modality = "group" | "private";
export type Currency = "USD" | "CLP";

export interface CartItem {
  id: string;
  tour: Tour;
  date: string;
  travelers: number;
  modality: Modality;
}

/**
 * Precio por persona según modalidad. Única fuente de verdad: el carrito, el
 * mensaje de WhatsApp y el registro en Supabase deben coincidir siempre.
 * Si el tour no ofrece modalidad privada, cae al precio grupal.
 */
export const unitPrice = (tour: Tour, modality: Modality): number =>
  modality === "private" ? tour.pricePrivate ?? tour.price : tour.price;

export const unitPriceCLP = (tour: Tour, modality: Modality, rate: number): number => {
  const usd = unitPrice(tour, modality);
  return Math.round((usd * rate) / 1000) * 1000;
};

interface CartContextProps {
  items: CartItem[];
  addToCart: (tour: Tour, date: string, travelers: number, modality?: Modality) => void;
  removeFromCart: (id: string) => void;
  updateTravelers: (id: string, travelers: number) => void;
  total: number;
  totalCLP: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  formatPrice: (usdPrice: number) => string;
  getTourPriceVal: (tour: Tour, modality: Modality) => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(980);

  useEffect(() => {
    fetch("https://mindicador.cl/api/dolar")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.serie && data.serie[0] && data.serie[0].valor) {
          setExchangeRate(data.serie[0].valor);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch exchange rate from mindicador.cl, using fallback 980", err);
      });
  }, []);

  const addToCart = (tour: Tour, date: string, travelers: number, modality: Modality = "group") => {
    if (!date) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), tour, date, travelers, modality }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTravelers = (id: string, travelers: number) => {
    if (travelers < 1) return;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, travelers } : item));
  };

  const total = items.reduce(
    (sum, item) => sum + unitPrice(item.tour, item.modality) * item.travelers,
    0,
  );

  const totalCLP = items.reduce(
    (sum, item) => sum + unitPriceCLP(item.tour, item.modality, exchangeRate) * item.travelers,
    0,
  );

  const getTourPriceVal = (tour: Tour, modality: Modality): number => {
    const usd = unitPrice(tour, modality);
    if (currency === "USD") return usd;
    return Math.round((usd * exchangeRate) / 1000) * 1000;
  };

  const formatPrice = (usdPrice: number): string => {
    if (currency === "USD") {
      return `$${usdPrice} USD`;
    } else {
      const clp = Math.round((usdPrice * exchangeRate) / 1000) * 1000;
      return `$${clp.toLocaleString("es-CL")} CLP`;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateTravelers,
        total,
        totalCLP,
        isCartOpen,
        setIsCartOpen,
        currency,
        setCurrency,
        exchangeRate,
        formatPrice,
        getTourPriceVal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
