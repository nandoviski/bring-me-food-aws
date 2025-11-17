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
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export function ChefDashboard() {
  return (
    <MainPageWithHeader
      title="Dashboard"
      description="Overview of your chef account"
    >
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
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Popular Meals</CardTitle>
            <CardDescription>Your top selling meals this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground py-8 text-center text-sm">
              <p>Popular meals analytics coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Meals
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainPageWithHeader>
  );
}
