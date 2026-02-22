"use client";

import { useState } from "react";
import { useGetAdminOrdersQuery, type AdminOrder } from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-gray-100 text-gray-600",
    REFUNDED: "bg-purple-100 text-purple-700",
    FAILED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function OrderDetailDialog({ order, open, onClose }: { order: AdminOrder; open: boolean; onClose: () => void }) {
  const customerName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.guestName ?? "Guest";
  const customerEmail = order.customer?.user?.email ?? order.guestEmail ?? "-";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Status */}
          <div className="flex gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>

          {/* Chef */}
          <div>
            <p className="font-medium text-gray-700">Chef</p>
            <p className="text-gray-600">{order.chef.name} (@{order.chef.username})</p>
          </div>

          {/* Customer */}
          <div>
            <p className="font-medium text-gray-700">Customer</p>
            <p className="text-gray-600">{customerName}</p>
            <p className="text-gray-400">{customerEmail}</p>
            {order.guestPhone && <p className="text-gray-400">{order.guestPhone}</p>}
          </div>

          {/* Delivery */}
          <div>
            <p className="font-medium text-gray-700">Delivery Address</p>
            <p className="text-gray-600">{order.deliveryAddress}</p>
            {order.notes && <p className="mt-1 text-gray-400 italic">Note: {order.notes}</p>}
          </div>

          {/* Line items */}
          <div>
            <p className="font-medium text-gray-700">Items</p>
            <ul className="mt-1 divide-y divide-gray-100 rounded-md border">
              {order.mealsOnOrders.map((item, i) => (
                <li key={i} className="flex justify-between px-3 py-2 text-gray-600">
                  <span>{item.meal.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="rounded-md bg-gray-50 p-3 space-y-1">
            {order.promoCode && (
              <div className="flex justify-between text-gray-500">
                <span>Promo ({order.promoCode})</span>
                <span>-{formatCurrency(order.discountAmount ?? 0)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Placed {format(new Date(order.createdAt), "PPp")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading, error } = useGetAdminOrdersQuery({ page, limit: 20, status, paymentStatus });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data ? `${data.pagination.total} total orders` : "Platform-wide order history"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={status || "all"}
          onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus || "all"}
          onValueChange={(v) => { setPaymentStatus(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="PENDING">Unpaid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-gray-400">
              Loading orders…
            </div>
          ) : error || !data ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              Failed to load orders.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Chef</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-gray-400">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.orders.map((order) => {
                    const customerName = order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : order.guestName ?? "Guest";
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs text-gray-500">
                          {order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm">{customerName}</TableCell>
                        <TableCell className="text-sm text-gray-600">{order.chef.name}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={order.paymentStatus} />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {format(new Date(order.createdAt), "dd MMM HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
