import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChefOrdersSection } from "../../../order/components/chef-orders-section";
import { StatsCards } from "./stats-cards";
import { GettingStarted } from "./getting-started";
import { PopularMealsCard } from "./popular-meals-card";
import Link from "next/link";

export function ChefDashboard() {
  return (
    <div className="flex-1 space-y-4 overflow-auto">
      <GettingStarted />
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Clock className="h-4 w-4" />
        <span>Last 7 days</span>
      </Button>
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your recent customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ChefOrdersSection />
          </CardContent>
          <CardFooter>
            <Link
              href="/account/chef/orders"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium shadow-xs transition-colors"
            >
              View All Orders
            </Link>
          </CardFooter>
        </Card>
        <PopularMealsCard />
      </div>
    </div>
  );
}
