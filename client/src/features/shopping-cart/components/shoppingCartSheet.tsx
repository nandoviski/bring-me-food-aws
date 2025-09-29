"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ChevronLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useShoppingCart } from "../context/shoppingCartContext";
import { Separator } from "@/components/ui/separator";

type Props = {
  children: ReactNode;
};

export default function ShoppingCartSheet({ children }: Props) {
  const {
    cartItems,
    increaseItemQuantity,
    decreaseItemQuantity,
    removeItem,
    cartQuantity,
  } = useShoppingCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const deliveryFee = 3.99;
  const total = subtotal + deliveryFee;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex h-full flex-col p-0" side="right">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              <SheetTitle>Your Cart ({cartQuantity})</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">
                Your cart is empty
              </h3>
              <p className="mt-1 text-gray-500">
                Looks like you haven&apos;t added any meals yet.
              </p>
              <SheetClose asChild>
                <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Browse Meals
                </Button>
              </SheetClose>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                    <p>#FIXME</p>
                    <Image
                      src={
                        item.image && item.image !== ""
                          ? item.image
                          : "/placeholder.svg"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center rounded-md border">
                        <button
                          onClick={() => decreaseItemQuantity(item.id)}
                          className="p-1 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => increaseItemQuantity(item)}
                          className="p-1 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <SheetFooter className="flex-col border-t bg-gray-50 p-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="mt-4 w-full bg-orange-500 hover:bg-orange-600">
                Proceed to Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
