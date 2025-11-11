"use client";

import { useAuth } from "@/lib/auth";
import { useGetOrdersByChefIdQuery } from "@/state/api";
import type { ChefOrderWithDetails } from "@/features/checkout/schema/order";
import Loading from "@/components/loading";
import Error from "@/components/error";
import { OrdersList } from "./orders-list";

interface OrderForList {
  id: string;
  customer: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    available: boolean;
    orderCount: number;
    ingredients: string[];
    allergens: string[];
  }>;
  status: string;
  total: number;
}

function transformOrder(order: ChefOrderWithDetails): OrderForList {
  return {
    id: order.id,
    customer: `${order.customer.firstName} ${order.customer.lastName}`,
    date: new Date(order.createdAt).toISOString().split("T")[0],
    items: order.mealsOnOrders.map((mealOrder) => ({
      id: mealOrder.meal.id,
      name: mealOrder.meal.name,
      description: mealOrder.meal.description,
      price: mealOrder.meal.price,
      image: mealOrder.meal.image || "/placeholder.svg",
      category: "",
      available: true,
      orderCount: 0,
      ingredients: [],
      allergens: [],
    })),
    status:
      order.status.toLowerCase() === "pending"
        ? "preparing"
        : order.status.toLowerCase(),
    total: order.total,
  };
}

export function ChefOrdersSection() {
  const { user: loggedUser } = useAuth();
  const chefId = loggedUser?.chef?.id || "";

  const {
    data: orders,
    error,
    isLoading,
    isFetching,
  } = useGetOrdersByChefIdQuery({ chefId }, { skip: !chefId });

  if (!chefId) {
    return (
      <Error message="Chef information not available" fetchingError={null} />
    );
  }

  if (isLoading || isFetching) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return <Error message="Error loading orders" fetchingError={error} />;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  const transformedOrders = orders.map(transformOrder);

  return <OrdersList orders={transformedOrders} />;
}
