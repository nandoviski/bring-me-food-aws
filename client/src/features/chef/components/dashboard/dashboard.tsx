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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MealsList } from "@/features/meal/components/meals-list";
import { MenusList } from "@/features/menu/components/menus-list";
import { ChefOrdersSection } from "./chef-orders-section";
import { StatsCards } from "./stats-cards";

export function ChefDashboard() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Chef Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your meals, menus, and orders
        </p>
      </div>
      <Tabs defaultValue="overview">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="mt-4 space-y-4">
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
                <CardDescription>
                  Your top selling meals this week
                </CardDescription>
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
        </TabsContent>
        <TabsContent value="meals" className="mt-4">
          <MealsList />
        </TabsContent>
        <TabsContent value="menus" className="mt-4">
          <MenusList />
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <span>Orders</span>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Last 7 days</span>
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Manage your customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ChefOrdersSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
