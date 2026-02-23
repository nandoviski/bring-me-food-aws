"use client";

import { useState } from "react";
import { MoreHorizontal, CheckCircle, Truck, XCircle, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/schema/order";
import { useUpdateOrderStatusMutation } from "@/state/api";

type OrdersTableProps = {
  orders: Order[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <>
      {/* Mobile: card layout */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <OrderMobileCard key={order.id} order={order} />
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function OrderMobileCard({ order }: OrderTableRowProps) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const [optimisticStatus, setOptimisticStatus] = useState(order.status);

  const handleStatusChange = async (
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED"
  ) => {
    setOptimisticStatus(status);
    try {
      await updateStatus({ orderId: order.id, status }).unwrap();
    } catch {
      setOptimisticStatus(order.status);
    }
  };

  const itemCount = order.mealsOnOrders?.length ?? 0;
  const customerName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.guestName ?? "—";
  const phone = order.guestPhone ?? order.customer?.phoneNumber;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</div>
          <div className="mt-0.5 font-medium text-slate-800">
            {customerName}
            {!order.customer && order.guestName && (
              <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Guest</span>
            )}
          </div>
          {phone && <div className="text-xs text-slate-400">{phone}</div>}
          {(order as any).outsideZone && (
            <div className="mt-1 inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
              ⚠️ Outside zone{(order as any).deliverySuburb ? ` · ${(order as any).deliverySuburb}` : ""}
            </div>
          )}
        </div>
        <OrderRowActions
          order={{ ...order, status: optimisticStatus as Order["status"] }}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <OrderStatusBadge status={optimisticStatus as Order["status"]} />
        <PaymentStatusBadge status={order.paymentStatus ?? "PENDING"} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">{itemCount} item{itemCount !== 1 ? "s" : ""} · {formatDate(order.createdAt)}</span>
        <div className="font-semibold text-slate-900">
          ${order.total.toFixed(2)}
          {order.promoCode && (
            <span className="ml-1 text-xs font-normal text-green-600">({order.promoCode})</span>
          )}
        </div>
      </div>

      {order.notes && (
        <div className="mt-2 flex items-start gap-1 text-xs text-slate-500">
          <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span className="italic">{order.notes}</span>
        </div>
      )}
    </div>
  );
}

type OrderTableRowProps = {
  order: Order;
};

function OrderTableRow({ order }: OrderTableRowProps) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const [optimisticStatus, setOptimisticStatus] = useState(order.status);

  const handleStatusChange = async (
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED"
  ) => {
    setOptimisticStatus(status);
    try {
      await updateStatus({ orderId: order.id, status }).unwrap();
    } catch {
      setOptimisticStatus(order.status); // revert on error
    }
  };

  const itemCount = order.mealsOnOrders?.length ?? 0;

  return (
    <TableRow className="border-b transition-colors hover:bg-slate-50">
      <TableCell className="font-mono text-xs text-slate-500">
        #{order.id.slice(0, 8)}
      </TableCell>
      <TableCell>
        {order.customer ? (
          `${order.customer.firstName} ${order.customer.lastName}`
        ) : order.guestName ? (
          <span className="inline-flex items-center gap-1.5">
            <span>{order.guestName}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Guest</span>
          </span>
        ) : (
          "—"
        )}
        {(order.guestPhone || order.customer?.phoneNumber) && (
          <div className="text-xs text-slate-400">
            {order.guestPhone ?? order.customer?.phoneNumber}
          </div>
        )}
        {(order as any).outsideZone && (
          <div className="mt-1 inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
            ⚠️ Outside zone{(order as any).deliverySuburb ? ` · ${(order as any).deliverySuburb}` : ""}
          </div>
        )}
        {order.notes && (
          <div className="mt-1 flex items-start gap-1 text-xs text-slate-500 max-w-[200px]">
            <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-slate-400" />
            <span className="line-clamp-2 italic">{order.notes}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-slate-600">
        {itemCount} item{itemCount !== 1 ? "s" : ""}
      </TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <OrderStatusBadge status={optimisticStatus as Order["status"]} />
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={order.paymentStatus ?? "PENDING"} />
      </TableCell>
      <TableCell className="font-semibold text-slate-900">
        ${order.total.toFixed(2)}
        {order.promoCode && (
          <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <Tag className="h-3 w-3" />
            <span>{order.promoCode}</span>
            {order.discountAmount && (
              <span className="text-slate-400">(−${order.discountAmount.toFixed(2)})</span>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <OrderRowActions
          order={{ ...order, status: optimisticStatus as Order["status"] }}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
        />
      </TableCell>
    </TableRow>
  );
}

type OrderStatusBadgeProps = {
  status: Order["status"];
};

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    CONFIRMED: {
      label: "Confirmed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    DELIVERED: {
      label: "Delivered",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const config = statusConfig[status] ?? { label: status, className: "border-slate-200 bg-slate-50 text-slate-600" };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

type PaymentStatusBadgeProps = {
  status: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
};

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Unpaid",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    PAID: {
      label: "Paid ✓",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    REFUNDED: {
      label: "Refunded",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    FAILED: {
      label: "Failed",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const config = statusConfig[status] ?? { label: status, className: "border-slate-200 bg-slate-50 text-slate-600" };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

type OrderRowActionsProps = {
  order: Order;
  onStatusChange: (status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED") => void;
  isLoading: boolean;
};

function OrderRowActions({ order, onStatusChange, isLoading }: OrderRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-slate-100" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        {order.status === "PENDING" && (
          <DropdownMenuItem onClick={() => onStatusChange("CONFIRMED")}>
            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
            Confirm Order
          </DropdownMenuItem>
        )}
        {order.status === "CONFIRMED" && (
          <DropdownMenuItem onClick={() => onStatusChange("DELIVERED")}>
            <Truck className="mr-2 h-4 w-4 text-emerald-500" />
            Mark as Delivered
          </DropdownMenuItem>
        )}
        {(order.status === "PENDING" || order.status === "CONFIRMED") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onStatusChange("CANCELLED")}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          </>
        )}
        {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
          <DropdownMenuItem disabled className="text-slate-400">
            No actions available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
