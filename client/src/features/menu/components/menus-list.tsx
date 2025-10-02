"use client";

import { CalendarDays, Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import AddMenuDialog from "./add-menu-dialog";
import EditMenuDialog from "./edit-menu-dialog";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { toast } from "sonner";
import type { Menu } from "@/features/menu/schema/menu";

export function MenusList() {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [dateNow] = useState(new Date().setHours(0, 0, 0, 0));
  const loggedUser = fakeLoggedUser();
  const [triggerDelete, { isLoading: isDeleting }] = useDeleteMenuMutation();

  const { data: menus } = useGetMenusByChefQuery({
    chefId: loggedUser.chef?.id ?? "",
    filter: "upcoming",
  });

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Weekly Menus</CardTitle>
            <CardDescription>Manage your weekly menus</CardDescription>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setAddMenuOpen(true)}
          >
            Create New Menu
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {!menus || menus.length < 1 ? (
              <div className="col-span-2">
                <p className="text-muted-foreground">
                  No menus available. Create a new menu.
                </p>
              </div>
            ) : (
              menus.map((menu) => (
                <Card key={menu.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{menu.name}</CardTitle>
                        <CardDescription>{menu.description}</CardDescription>
                      </div>
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
                            onClick={() => setEditingMenu(menu)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Menu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={isDeleting}
                            className="text-red-600"
                            onClick={() => handleDeleteMenu(menu.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Menu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CalendarDays className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-xs">
                        {new Date(menu.startDate).toDateString()} -{" "}
                        {new Date(menu.endDate).toDateString()}
                      </span>
                      {dateNow >= new Date(menu.startDate).getTime() &&
                        dateNow <= new Date(menu.endDate).getTime() && (
                          <Badge className="ml-auto bg-green-500">Active</Badge>
                        )}
                      {dateNow < new Date(menu.startDate).getTime() && (
                        <Badge className="ml-auto bg-blue-500">Upcoming</Badge>
                      )}
                      {dateNow > new Date(menu.endDate).getTime() && (
                        <Badge className="ml-auto bg-gray-500">Past</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Meals in this menu:
                      </h4>
                      <div className="grid gap-2">
                        {menu.meals?.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center gap-3"
                          >
                            <Image
                              src={
                                meal.image && meal.image !== ""
                                  ? meal.image
                                  : "/placeholder.svg"
                              }
                              alt={meal.name}
                              className="h-10 w-10 rounded-md object-cover"
                              width={40}
                              height={40}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{meal.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ${meal.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div>test</div>
        </CardFooter>
      </Card>

      <AddMenuDialog open={addMenuOpen} onOpenChange={setAddMenuOpen} />

      {editingMenu && (
        <EditMenuDialog
          open={!!editingMenu}
          onOpenChange={(open) => !open && setEditingMenu(null)}
          menu={editingMenu}
        />
      )}
    </>
  );
}
