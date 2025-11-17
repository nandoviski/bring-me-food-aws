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
import { useGetMealsByChefQuery } from "@/state/api";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import EditMealDialog from "./edit-meal-dialog";
import { useState } from "react";
import type { Meal } from "@/schema";
import { useAuth } from "@/lib/auth";
import AddMealDialog from "./add-meal-dialog";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export function MealsList() {
  const { user: loggedUser } = useAuth();
  const chefId = loggedUser?.chef ? loggedUser.chef.id : "";
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [addMealOpen, setAddMealOpen] = useState(false);

  const { data: meals } = useGetMealsByChefQuery({
    chefId: chefId,
  });

  return (
    <MainPageWithHeader title="Meals" description="Manage your meals">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Meals</CardTitle>
            <CardDescription>Manage your meals</CardDescription>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setAddMealOpen(true)}
          >
            Add New Meal
          </Button>
          <AddMealDialog open={addMealOpen} onOpenChange={setAddMealOpen} />
        </CardHeader>
        <CardContent>
          {meals && !meals.length && (
            <div className="col-span-2">
              <p className="text-muted-foreground">
                No meal available. Create a new meal.
              </p>
            </div>
          )}
          {meals && meals.length > 0 && (
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
                          unoptimized
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
                          <DropdownMenuItem
                            onClick={() => setEditingMeal(meal)}
                          >
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
          )}
        </CardContent>
      </Card>

      {editingMeal && (
        <EditMealDialog
          open={!!editingMeal}
          onOpenChange={(open) => !open && setEditingMeal(null)}
          meal={editingMeal}
        />
      )}
    </MainPageWithHeader>
  );
}
