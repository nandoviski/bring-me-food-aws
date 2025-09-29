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
import { useEffect, useState } from "react";
import { getMenusByChef } from "../db/menu";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import AddMenuDialog from "./add-menu-dialog";
import type { MenuWithMeals } from "../schema/menu";
import EditMenuDialog from "./edit-menu-dialog";

export function MenusList() {
  const [menus, setMenus] = useState<MenuWithMeals[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuWithMeals | null>(null);
  const [dateNow] = useState(new Date().setHours(0, 0, 0, 0));

  async function fetchMenus() {
    const fetchedMenus = await getMenusByChef();
    setMenus(fetchedMenus || []);
  }

  useEffect(() => {
    fetchMenus().catch((error) => {
      console.error("Error fetching menus:", error);
    });
  }, []);

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
            {!menus.length && (
              <div className="col-span-2">
                <p className="text-muted-foreground">
                  No menus available. Create a new menu.
                </p>
              </div>
            )}

            {menus.map((menu) => (
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
                        <DropdownMenuItem onClick={() => setEditingMenu(menu)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Menu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Menu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-xs">
                      {menu.startDate.toDateString()} -{" "}
                      {menu.endDate.toDateString()}
                    </span>
                    {dateNow >=
                      new Date(menu.startDate.toDateString()).getTime() &&
                      dateNow <=
                        new Date(menu.endDate.toDateString()).getTime() && (
                        <Badge className="ml-auto bg-green-500">Active</Badge>
                      )}
                    {dateNow < menu.startDate.getTime() && (
                      <Badge className="ml-auto bg-blue-500">Upcoming</Badge>
                    )}
                    {dateNow > menu.endDate.getTime() && (
                      <Badge className="ml-auto bg-gray-500">Past</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Meals in this menu:</h4>
                    <div className="grid gap-2">
                      {menu.meals?.map((meal) => (
                        <div key={meal.id} className="flex items-center gap-3">
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
            ))}
          </div>
        </CardContent>
      </Card>

      <AddMenuDialog
        open={addMenuOpen}
        onOpenChange={setAddMenuOpen}
        onMenuAdded={fetchMenus}
      />

      {editingMenu && (
        <EditMenuDialog
          open={!!editingMenu}
          onOpenChange={(open) => !open && setEditingMenu(null)}
          onMenuUpdated={fetchMenus}
          menu={editingMenu}
        />
      )}
    </>
  );
}
