import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  DollarSign,
  Package,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,248.32</div>
          <p className="text-muted-foreground text-xs">
            <span className="flex items-center text-green-500">
              <ArrowUp className="mr-1 h-4 w-4" />
              +18.2%
            </span>{" "}
            from last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-muted-foreground text-xs">
            <span className="flex items-center text-green-500">
              <ArrowUp className="mr-1 h-4 w-4" />
              +12.5%
            </span>{" "}
            from last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Meals</CardTitle>
          <CreditCard className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-muted-foreground text-xs">
            <span className="flex items-center text-red-500">
              <ArrowDown className="mr-1 h-4 w-4" />
              -2
            </span>{" "}
            from last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-muted-foreground text-xs">
            <span className="flex items-center text-green-500">
              <ArrowUp className="mr-1 h-4 w-4" />
              +3
            </span>{" "}
            from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
