"use client";

import type {
  Meal,
  CartItem,
  ShoppingCartProviderProps,
  ShoppingCartContextType,
} from "@/schema";
import { useState, useContext, createContext } from "react";

const ShoppingCartContext = createContext({} as ShoppingCartContextType);

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error(
      "useShoppingCart must be used within a ShoppingCartProvider",
    );
  }
  return context;
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  // const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartChefId, setCartChefId] = useState<string | null>(null);

  const cartQuantity = cartItems.reduce(
    (quantity, item) => quantity + item.quantity,
    0,
  );

  // const openCart = () => setIsOpen(true);
  // const closeCart = () => setIsOpen(false);

  const getItemQuantity = (id: string) => {
    return cartItems.find((item) => item.id === id)?.quantity ?? 0;
  };

  const increaseItemQuantityByMeal = (meal: Meal) => {
    // Capture the chefId from the meal so checkout forms can validate promo codes
    if (meal.chefId && !cartChefId) {
      setCartChefId(meal.chefId);
    }
    increaseItemQuantity({
      id: meal.id,
      image: meal.image,
      name: meal.name,
      price: meal.price,
    } as CartItem);
  };

  const increaseItemQuantity = (cartItem: CartItem) => {
    setCartItems((currItems) => {
      if (currItems.find((item) => item.id === cartItem.id) == null) {
        return [
          ...currItems,
          {
            id: cartItem.id,
            quantity: 1,
            image: cartItem.image,
            name: cartItem.name,
            price: cartItem.price,
          },
        ];
      } else {
        return currItems.map((item) => {
          if (item.id === cartItem.id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            return item;
          }
        });
      }
    });
  };

  const decreaseItemQuantity = (id: string) => {
    setCartItems((currItems) => {
      if (currItems.find((item) => item.id === id)?.quantity === 1) {
        return currItems.filter((item) => item.id !== id);
      } else {
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return item;
          }
        });
      }
    });
  };

  const removeItem = (id: string) => {
    setCartItems((currItems) => currItems.filter((item) => item.id !== id));
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        getItemQuantity,
        increaseItemQuantity,
        increaseItemQuantityByMeal,
        decreaseItemQuantity,
        removeItem,
        clearCart: () => { setCartItems([]); setCartChefId(null); },
        // isOpen,
        // openCart,
        // closeCart,
        cartItems,
        cartQuantity,
        cartChefId,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}
