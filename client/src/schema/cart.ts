import type { Meal } from "./meal";

export type CartItem = {
  id: string;
  quantity: number;
  image: string | null;
  name: string;
  price: number;
};

export type ShoppingCartProviderProps = {
  children: React.ReactNode;
};

export type ShoppingCartContextType = {
  cartItems: CartItem[];
  cartQuantity: number;
  cartChefId: string | null; // chefId derived from meals in cart
  increaseItemQuantityByMeal: (meal: Meal) => void;
  increaseItemQuantity: (cartItem: CartItem) => void;
  decreaseItemQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  getItemQuantity: (id: string) => number;
  clearCart: () => void;
};
