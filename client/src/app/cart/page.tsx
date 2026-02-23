"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";
import { ChevronLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <h1 className="text-lg font-semibold">
              Your Cart ({cartQuantity})
            </h1>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven&apos;t added any meals yet.
          </p>
          <Link href="/search">
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Browse Meals
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <ul className="divide-y bg-white px-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={
                      item.image && item.image !== ""
                        ? item.image
                        : "/placeholder.svg"
                    }
                    unoptimized
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <button
                        onClick={() => decreaseItemQuantity(item.id)}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseItemQuantity(item)}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Order summary */}
          <div className="mx-4 mt-4 rounded-lg bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout button — sticky at bottom */}
          <div className="sticky bottom-0 border-t bg-white p-4">
            <Button
              className="w-full bg-orange-500 py-6 text-base font-semibold hover:bg-orange-600"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout · ${total.toFixed(2)}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
