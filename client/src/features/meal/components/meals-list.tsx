"use client";

import { Edit, MoreHorizontal, Trash, Plus } from "lucide-react";
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
import type { Meal } from "@/schema";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type MealsListProps = Record<string, never>;

export function MealsList({}: MealsListProps) {
  const { user: loggedUser } = useAuth();
  const router = useRouter();
  const chefId = loggedUser?.chef ? loggedUser.chef.id : "";

  const { data: meals } = useGetMealsByChefQuery({
    chefId,
  });

  const handleEdit = (meal: Meal) => {
    router.push(`/account/chef/meals/${meal.id}/edit`);
  };

  const handleAddNew = () => {
    router.push("/account/chef/meals/add");
  };

  const mealCount = meals?.length ?? 0;
  const hasMeals = mealCount > 0;

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {hasMeals
            ? `You have ${mealCount} meal${mealCount !== 1 ? "s" : ""} available`
            : "Create your first meal to get started"}
        </p>
        <Button
          className="bg-admin-green hover:bg-admin-green-hover"
          onClick={handleAddNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Meal
        </Button>
      </div>

      {/* Content Section */}
      {!hasMeals ? (
        <MealsEmptyState onAddMeal={handleAddNew} />
      ) : (
        <MealsTable meals={meals!} onEditMeal={handleEdit} />
      )}
    </div>
  );
}

type MealsEmptyStateProps = {
  onAddMeal: () => void;
};

function MealsEmptyState({ onAddMeal }: MealsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Plus className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        No meals yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-600">
        Start building your menu by adding your first meal. Your customers will
        see these meals on your profile.
      </p>
    </div>
  );
}

type MealsTableProps = {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
};

function MealsTable({ meals, onEditMeal }: MealsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="font-semibold">Meal</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Size</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <MealTableRow key={meal.id} meal={meal} onEdit={onEditMeal} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type MealTableRowProps = {
  meal: Meal;
  onEdit: (meal: Meal) => void;
};

function MealTableRow({ meal, onEdit }: MealTableRowProps) {
  return (
    <TableRow className="border-b transition-colors hover:bg-slate-50">
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Image
            src={meal.image || "/placeholder.svg"}
            alt={meal.name}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-md object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{meal.name}</span>
            <span className="text-muted-foreground line-clamp-1 text-xs">
              {meal.description}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-semibold text-slate-900">
        ${meal.price.toFixed(2)}
      </TableCell>
      <TableCell className="text-slate-600">
        {meal.size ? `${meal.size}g` : "—"}
      </TableCell>
      <TableCell className="text-right">
        <MealRowActions meal={meal} onEdit={onEdit} />
      </TableCell>
    </TableRow>
  );
}

type MealRowActionsProps = {
  meal: Meal;
  onEdit: (meal: Meal) => void;
};

function MealRowActions({ meal, onEdit }: MealRowActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(meal)}>
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
  );
}
