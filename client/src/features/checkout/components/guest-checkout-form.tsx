"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/state/api";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";
import type { OrderCreate } from "@/schema";
import { ChevronDownIcon, Package, User } from "lucide-react";

export default function GuestCheckoutForm() {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { cartItems, clearCart } = useShoppingCart();
  const [confirmation, setConfirmation] = useState<null | { orderId: string }>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const payload: OrderCreate = {
      guestName: (formData.get("guestName") as string) || "",
      guestPhone: (formData.get("guestPhone") as string) || "",
      guestEmail: (formData.get("guestEmail") as string) || undefined,
      meals: cartItems.map((c) => ({
        mealId: c.id,
        quantity: c.quantity,
      })),
      notes: (formData.get("notes") as string) || undefined,
      deliveryAddress: (formData.get("address") as string) || "",
      deliveryFee,
    };

    try {
      const resp = await createOrder(payload).unwrap();
      setConfirmation({ orderId: resp.orderId });
      clearCart();
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create order. Please try again.");
    }
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24">
        <div className="rounded-md bg-white p-8 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order placed!</h3>
              <p className="text-sm text-gray-500">Order ID: {confirmation.orderId}</p>
            </div>
          </div>

          <div className="text-sm text-gray-700 space-y-2 mt-4">
            <p className="font-medium text-gray-900">What happens next</p>
            <ul className="ml-4 list-disc space-y-1 text-gray-600">
              <li>The chef will review your order and confirm availability.</li>
              <li>They will contact you via phone to arrange payment and delivery/pickup.</li>
              <li>If they can&apos;t reach you, check your email (if provided) and spam folder.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-md bg-orange-500 px-4 py-3 text-sm font-medium text-white hover:bg-orange-600"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Notice banner */}
        <div className="mb-6 rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-700">
              <p className="font-medium text-orange-800">Checking out as a guest</p>
              <p className="mt-1">
                No account needed. Just leave your contact details so the chef can reach you.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium text-blue-800">About payments: </span>
            We don&apos;t process payments online yet. The chef will contact you to arrange payment and delivery.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
          onSubmit={handleSubmit}
        >
          <div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                    Your name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="guestName"
                      name="guestName"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="guestPhone"
                      name="guestPhone"
                      type="tel"
                      required
                      placeholder="0400 000 000"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="guestEmail"
                      name="guestEmail"
                      type="email"
                      placeholder="jane@example.com"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-lg font-medium text-gray-900">Delivery</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Delivery address
                  </label>
                  <div className="mt-1">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Main St, Sydney NSW 2000"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-md border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      name="deliveryMethod"
                      type="radio"
                      value="pickup"
                      defaultChecked
                      className="mt-1 h-4 w-4 text-orange-500"
                      onChange={() => setDeliveryFee(0)}
                    />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-900">Pickup</span>
                        <span className="text-sm text-gray-500">Free</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">Pick up from the chef&apos;s location.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-md border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      name="deliveryMethod"
                      type="radio"
                      value="delivery"
                      className="mt-1 h-4 w-4 text-orange-500"
                      onChange={() => setDeliveryFee(10)}
                    />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-900">Delivery</span>
                        <span className="text-sm text-gray-500">+$10.00</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">Delivered to your address.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes for the chef <span className="text-gray-400">(optional)</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Any dietary requirements, allergies, or special requests..."
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-xs">
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex px-4 py-6 sm:px-6">
                    <div className="shrink-0">
                      <img
                        alt={item.name}
                        src={item.image ?? "/placeholder.svg"}
                        className="w-20 rounded-md object-cover"
                      />
                    </div>
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="space-y-4 border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Delivery</dt>
                  <dd className="text-sm font-medium text-gray-900">${deliveryFee.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-semibold">Total</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    ${(subtotal + deliveryFee).toFixed(2)}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-orange-500 px-4 py-3 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {isLoading ? "Placing order…" : "Confirm order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
