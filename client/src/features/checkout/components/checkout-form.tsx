"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/state/api";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";
import type { Customer } from "@/features/customer/schema/customer";
import { ChevronDownIcon, TrashIcon } from "lucide-react";
import { CreateOrderSchema } from "../schema/order";

type Props = {
  customer: Customer;
  userEmail: string;
};

export default function CheckoutForm({ customer, userEmail }: Props) {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { cartItems, clearCart } = useShoppingCart();
  const [confirmation, setConfirmation] = useState<null | { orderId: string }>(
    null,
  );
  const [deliveryCost, setDeliveryCost] = useState<number>(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const address = (formData.get("address") as string) || "";
    const notes = (formData.get("notes") as string) || "";

    const payload: CreateOrderSchema = {
      customerId: customer.id,
      mealsOnOrders: cartItems.map((c) => ({
        mealId: c.id,
        quantity: c.quantity,
      })),
      notes,
      deliveryAddress: address,
      chefId: "",
    };

    try {
      const resp = await createOrder(payload).unwrap();
      setConfirmation({ orderId: resp.orderId });
      clearCart();
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message || "Failed to create order");
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Checkout</h2>
        {confirmation ? (
          <div className="rounded-md bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900">Order placed</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your order id is <strong>{confirmation.orderId}</strong>. The chef
              will review the order and contact you to arrange payment and
              delivery.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-md bg-orange-500 px-4 py-2 text-white"
              >
                Back to home
              </button>
            </div>
          </div>
        ) : (
          <form
            className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Contact information
                </h2>

                <div className="mt-4">
                  <label
                    htmlFor="email-address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email-address"
                      name="email-address"
                      type="email"
                      defaultValue={userEmail}
                      readOnly
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">
                  Shipping information
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        defaultValue={customer.firstName}
                        autoComplete="given-name"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        defaultValue={customer.lastName}
                        autoComplete="family-name"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <div className="mt-2">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        defaultValue={customer.address}
                        autoComplete="street-address"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      City
                    </label>
                    <div className="mt-2">
                      <input
                        id="city"
                        name="city"
                        type="text"
                        defaultValue={customer.city}
                        autoComplete="address-level2"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      >
                        <option value="AU">Australia</option>
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      State
                    </label>
                    <div className="mt-2">
                      <input
                        id="region"
                        name="region"
                        type="text"
                        defaultValue={customer.state}
                        autoComplete="address-level1"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="postal-code"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Postal code
                    </label>
                    <div className="mt-2">
                      <input
                        id="postal-code"
                        name="postal-code"
                        type="text"
                        defaultValue={customer.postalCode}
                        autoComplete="postal-code"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm/6 font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <div className="mt-2">
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        defaultValue={customer.phoneNumber}
                        autoComplete="tel"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">
                  Delivery method
                </h2>
                <div className="mt-4">
                  <div className="space-y-4">
                    <label
                      htmlFor="delivery"
                      className="flex items-start gap-3 rounded-md border border-gray-200 p-4"
                    >
                      <input
                        id="delivery"
                        name="deliveryMethod"
                        type="radio"
                        value="delivery"
                        defaultChecked
                        className="mt-1 h-4 w-4 text-indigo-600"
                        onChange={() => setDeliveryCost(10)}
                      />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            Delivery
                          </span>
                          <span className="text-sm text-gray-500">$10.00</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Delivered to your address (adds $10 to the order).
                        </p>
                      </div>
                    </label>

                    <label
                      htmlFor="pickup"
                      className="flex items-start gap-3 rounded-md border border-gray-200 p-4"
                    >
                      <input
                        id="pickup"
                        name="deliveryMethod"
                        type="radio"
                        value="pickup"
                        className="mt-1 h-4 w-4 text-indigo-600"
                        onChange={() => setDeliveryCost(0)}
                      />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            Pickup
                          </span>
                          <span className="text-sm text-gray-500">Free</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Pick up from the chef's location (no delivery fee).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">
                Order summary
              </h2>

              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-xs">
                <h3 className="sr-only">Items in your cart</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex px-4 py-6 sm:px-6">
                      <div className="shrink-0">
                        <img
                          alt={item.name}
                          src={item.image ?? "/placeholder.svg"}
                          className="w-20 rounded-md"
                        />
                      </div>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm">
                              <span className="font-medium text-gray-700">
                                {item.name}
                              </span>
                            </h4>
                          </div>

                          <div className="ml-4 flow-root shrink-0">
                            <button
                              type="button"
                              className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Remove</span>
                              <TrashIcon
                                aria-hidden="true"
                                className="size-5"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-1 items-end justify-between pt-2">
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>

                          <div className="ml-4">
                            <div className="grid grid-cols-1">
                              <select
                                id={`quantity-${item.id}`}
                                name={`quantity-${item.id}`}
                                aria-label="Quantity"
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                value={item.quantity}
                                onChange={() => {}}
                              >
                                {Array.from({ length: 8 }).map((_, i) => (
                                  <option value={i + 1} key={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      $
                      {cartItems
                        .reduce((s, it) => s + it.price * it.quantity, 0)
                        .toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Shipping</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ${deliveryCost.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium">Total</dt>
                    <dd className="text-base font-medium text-gray-900">
                      $
                      {(
                        cartItems.reduce(
                          (s, it) => s + it.price * it.quantity,
                          0,
                        ) + deliveryCost
                      ).toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <button
                    type="submit"
                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                  >
                    Confirm order
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
