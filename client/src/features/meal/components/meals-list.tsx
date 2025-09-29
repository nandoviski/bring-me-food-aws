"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getMealsByChef } from "../server/db/meal";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AddMealButton from "./add-meal-button";
import EditMealDialog from "./edit-meal-dialog";
import { useEffect, useState } from "react";
import { type Meal } from "@/state/apiTypes";

export function MealsList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  async function fetchMeals() {
    const fetchedMeals = await getMealsByChef();
    setMeals(fetchedMeals ?? []);
  }

  useEffect(() => {
    fetchMeals().catch((error) => {
      console.error("Error fetching meals:", error);
    });
  }, []);

  if (!meals.length) {
    return <div>No meals found</div>;
  }

  return (
    <div className="rounded-md border">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Meals</CardTitle>
            <CardDescription>Manage your available meals</CardDescription>
          </div>
          <AddMealButton onMealAdded={fetchMeals} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          meal.image && meal.image !== ""
                            ? meal.image
                            : "/placeholder.svg"
                        }
                        alt={meal.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{meal.name}</span>
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {meal.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${meal.price.toFixed(2)}</TableCell>
                  <TableCell>{meal.size}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingMeal(meal)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Meal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Meal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingMeal && (
        <EditMealDialog
          open={!!editingMeal}
          onOpenChange={(open) => !open && setEditingMeal(null)}
          onMealUpdated={fetchMeals}
          meal={editingMeal}
        />
      )}
    </div>
  );
}
