import { MoreHorizontal } from "lucide-react";
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

type OrdersTableProps = {
  orders: Order[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold">Order ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
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
  );
}

type OrderTableRowProps = {
  order: Order;
};

function OrderTableRow({ order }: OrderTableRowProps) {
  return (
    <TableRow className="border-b transition-colors hover:bg-slate-50">
      <TableCell className="font-medium">{order.id}</TableCell>
      <TableCell>
        {order.customer &&
          `${order.customer.firstName} ${order.customer.lastName}`}
      </TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="font-semibold text-slate-900">
        ${order.total.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        <OrderRowActions order={order} />
      </TableCell>
    </TableRow>
  );
}

type OrderStatusBadgeProps = {
  status: Order["status"];
};

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    preparing: {
      label: "Preparing",
      className: "border-yellow-200 bg-yellow-50 text-yellow-700",
    },
    ready: {
      label: "Ready for Pickup",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    completed: {
      label: "Completed",
      className: "border-green-200 bg-green-50 text-green-700",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

type OrderRowActionsProps = {
  order: Order;
};

function OrderRowActions({ order }: OrderRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-slate-100">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>View Order Details</DropdownMenuItem>
        {order.status === "preparing" && (
          <DropdownMenuItem>Mark as Ready</DropdownMenuItem>
        )}
        {order.status === "ready" && (
          <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
