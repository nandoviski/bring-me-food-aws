import { BarChart3, Clock } from "lucide-react";
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
import { OrdersList } from "./orders-list";
import { StatsCards } from "./stats-cards";
import Image from "next/image";

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
                <CardDescription>
                  You have {mockOrders.length} orders this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersList orders={mockOrders.slice(0, 5)} />
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
                <div className="space-y-4">
                  {mockMeals.slice(0, 4).map((meal) => (
                    <div key={meal.id} className="flex items-center gap-4">
                      <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src={
                            meal.image && meal.image !== ""
                              ? meal.image
                              : "/placeholder.svg"
                          }
                          width={64}
                          height={64}
                          alt={meal.name}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{meal.name}</p>
                        <div className="text-muted-foreground flex items-center text-sm">
                          <BarChart3 className="mr-1 h-4 w-4" />
                          <span>{meal.orderCount} orders</span>
                        </div>
                      </div>
                      <div className="font-medium">
                        ${meal.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
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
              <OrdersList orders={mockOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

// Mock data
const mockMeals = [
  {
    id: "1",
    name: "Homemade Lasagna",
    description:
      "Traditional Italian lasagna with homemade pasta and rich meat sauce",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Italian",
    available: true,
    orderCount: 24,
    ingredients: ["Pasta", "Ground Beef", "Tomato Sauce", "Cheese"],
    allergens: ["Gluten", "Dairy"],
  },
  {
    id: "2",
    name: "Vegetable Curry",
    description: "Spicy vegetable curry with basmati rice",
    price: 10.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Indian",
    available: true,
    orderCount: 18,
    ingredients: ["Mixed Vegetables", "Curry Paste", "Coconut Milk", "Rice"],
    allergens: ["None"],
  },
  {
    id: "3",
    name: "Chicken Alfredo",
    description: "Creamy pasta with grilled chicken and parmesan",
    price: 11.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Italian",
    available: true,
    orderCount: 15,
    ingredients: ["Pasta", "Chicken", "Cream", "Parmesan"],
    allergens: ["Gluten", "Dairy"],
  },
  {
    id: "4",
    name: "Beef Tacos",
    description:
      "Authentic Mexican tacos with seasoned beef and fresh toppings",
    price: 9.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Mexican",
    available: false,
    orderCount: 12,
    ingredients: ["Tortillas", "Beef", "Lettuce", "Cheese", "Salsa"],
    allergens: ["Gluten", "Dairy"],
  },
  {
    id: "5",
    name: "Vegan Buddha Bowl",
    description:
      "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
    price: 10.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Vegan",
    available: true,
    orderCount: 10,
    ingredients: ["Quinoa", "Sweet Potato", "Chickpeas", "Kale", "Tahini"],
    allergens: ["Sesame"],
  },
  {
    id: "6",
    name: "Sushi Platter",
    description: "Assorted sushi rolls with soy sauce and wasabi",
    price: 14.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Japanese",
    available: true,
    orderCount: 8,
    ingredients: ["Rice", "Nori", "Fish", "Vegetables"],
    allergens: ["Fish", "Soy"],
  },
];

const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    date: "2025-04-05",
    items: [mockMeals[0]!],
    status: "completed",
    total: 12.99,
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    date: "2025-04-05",
    items: [mockMeals[1]!, mockMeals[4]!],
    status: "preparing",
    total: 21.98,
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    date: "2025-04-04",
    items: [mockMeals[2]!],
    status: "ready",
    total: 11.99,
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    date: "2025-04-04",
    items: [mockMeals[3]!, mockMeals[0]!],
    status: "completed",
    total: 22.98,
  },
  {
    id: "ORD-005",
    customer: "David Wilson",
    date: "2025-04-03",
    items: [mockMeals[5]!],
    status: "completed",
    total: 14.99,
  },
  {
    id: "ORD-006",
    customer: "Jessica Martinez",
    date: "2025-04-03",
    items: [mockMeals[4]!, mockMeals[1]!],
    status: "completed",
    total: 21.98,
  },
  {
    id: "ORD-007",
    customer: "Robert Taylor",
    date: "2025-04-02",
    items: [mockMeals[2]!, mockMeals[3]!],
    status: "completed",
    total: 21.98,
  },
  {
    id: "ORD-008",
    customer: "Jennifer Anderson",
    date: "2025-04-02",
    items: [mockMeals[0]!],
    status: "completed",
    total: 12.99,
  },
];
