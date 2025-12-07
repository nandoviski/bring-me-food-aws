"use client";

import { CalendarDays, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useGetMenusByChefQuery, useDeleteMenuMutation } from "@/state/api";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Menu, Meal } from "@/schema";

type MenusListProps = Record<string, never>;

export function MenusList({}: MenusListProps) {
  const [dateNow] = useState(new Date().setHours(0, 0, 0, 0));
  const { user: loggedUser } = useAuth();
  const router = useRouter();
  const [triggerDelete, { isLoading: isDeleting }] = useDeleteMenuMutation();

  if (!loggedUser || !loggedUser.chef) {
    return (
      <p className="text-muted-foreground">
        You must be logged in as a chef to view menus.
      </p>
    );
  }

  const { data: menus } = useGetMenusByChefQuery({
    chefId: loggedUser.chef.id,
    filter: "upcoming",
  });

  const handleAddNew = () => {
    router.push("/account/chef/menus/add");
  };

  const handleEdit = (menu: Menu) => {
    router.push(`/account/chef/menus/${menu.id}/edit`);
  };

  async function handleDeleteMenu(menuId: string) {
    if (confirm("Are you sure you want to delete this menu?")) {
      const deleted = await triggerDelete(menuId);
      if (deleted.data) {
        toast.success("Menu deleted successfully");
      } else {
        toast.error("Error deleting menu");
      }
    }
  }

  const menuCount = menus?.length ?? 0;
  const hasMenus = menuCount > 0;

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {hasMenus
            ? `You have ${menuCount} menu${menuCount !== 1 ? "s" : ""} available`
            : "Create your first menu to get started"}
        </p>
        <Button
          className="bg-admin-green hover:bg-admin-green-hover"
          onClick={handleAddNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Menu
        </Button>
      </div>

      {/* Content Section */}
      {!hasMenus ? (
        <MenusEmptyState onAddMenu={handleAddNew} />
      ) : (
        <MenusGrid
          menus={menus!}
          dateNow={dateNow}
          onEditMenu={handleEdit}
          onDeleteMenu={handleDeleteMenu}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

type MenusEmptyStateProps = {
  onAddMenu: () => void;
};

function MenusEmptyState({ onAddMenu }: MenusEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Plus className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        No menus yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-600">
        Start building your menu offerings to attract customers. Each menu can
        contain multiple meals with specific availability dates.
      </p>
    </div>
  );
}

type MenusGridProps = {
  menus: Menu[];
  dateNow: number;
  onEditMenu: (menu: Menu) => void;
  onDeleteMenu: (menuId: string) => void;
  isDeleting: boolean;
};

function MenusGrid({
  menus,
  dateNow,
  onEditMenu,
  onDeleteMenu,
  isDeleting,
}: MenusGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          dateNow={dateNow}
          onEdit={onEditMenu}
          onDelete={onDeleteMenu}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}

type MenuCardProps = {
  menu: Menu;
  dateNow: number;
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  isDeleting: boolean;
};

function MenuCard({
  menu,
  dateNow,
  onEdit,
  onDelete,
  isDeleting,
}: MenuCardProps) {
  const status = getMenuStatus(dateNow, menu.startDate, menu.endDate);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900">
              {menu.name}
            </h3>
            <p className="line-clamp-2 text-sm text-slate-600">
              {menu.description}
            </p>
          </div>
          <MenuCardActions
            menu={menu}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>

        {/* Date and Status */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-600">
            {new Date(menu.startDate).toDateString()} -{" "}
            {new Date(menu.endDate).toDateString()}
          </span>
          <Badge
            variant="secondary"
            className={`ml-auto ${getStatusBadgeColor(status)}`}
          >
            {status}
          </Badge>
        </div>
      </div>

      {/* Meals */}
      <div className="flex-1 space-y-3 p-4">
        <h4 className="text-sm font-medium text-slate-900">Meals included</h4>
        <div className="space-y-2">
          {menu.meals && menu.meals.length > 0 ? (
            menu.meals.map((meal) => <MealItem key={meal.id} meal={meal} />)
          ) : (
            <p className="text-xs text-slate-500">No meals added yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </div>
    </div>
  );
}

type MealItemProps = {
  meal: Meal;
};

function MealItem({ meal }: MealItemProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={meal.image || "/placeholder.svg"}
        alt={meal.name}
        className="h-10 w-10 shrink-0 rounded-md object-cover"
        unoptimized
        width={40}
        height={40}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {meal.name}
        </p>
        <p className="text-xs text-slate-600">${meal.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

type MenuCardActionsProps = {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: string) => void;
  isDeleting: boolean;
};

function MenuCardActions({
  menu,
  onEdit,
  onDelete,
  isDeleting,
}: MenuCardActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(menu)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Menu
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isDeleting}
          className="text-red-600"
          onClick={() => onDelete(menu.id)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete Menu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MenuStatus = "Active" | "Upcoming" | "Past";

function getMenuStatus(
  dateNow: number,
  startDate: Date | string,
  endDate: Date | string,
): MenuStatus {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (dateNow >= start && dateNow <= end) {
    return "Active";
  }
  if (dateNow < start) {
    return "Upcoming";
  }
  return "Past";
}

function getStatusBadgeColor(status: MenuStatus): string {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Past":
      return "bg-gray-100 text-gray-800";
  }
}
