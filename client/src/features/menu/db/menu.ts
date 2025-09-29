"use server";

import { loggedChefId } from "@/lib/authUtils";
import { db } from "@/server/db";
import { type EditMenuType } from "../schema/menu";

export async function getMenusByChef() {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  const coco = await db.menu.findMany({
    where: { chefId },
    include: {
      meals: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return coco;
}

export async function addMenuToChef(menu: EditMenuType) {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  try {
    const result = await db.menu.create({
      data: {
        ...menu,
        chefId,
        meals: {
          connect: menu.meals.map((mealId) => ({ id: mealId })),
        },
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Menu creation failed",
      };
    }

    return {
      success: true,
      message: "Menu created successfully",
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "Error creating menu";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function updateMenu(menuId: string, menu: EditMenuType) {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  try {
    const existingMenu = await db.menu.findUnique({
      where: { id: menuId, chefId },
      include: { meals: true },
    });

    if (!existingMenu) {
      return {
        success: false,
        message: "Menu not found",
      };
    }

    // Disconnect all existing meals first
    await db.menu.update({
      where: { id: menuId },
      data: {
        meals: {
          disconnect: existingMenu.meals.map((meal) => ({ id: meal.id })),
        },
      },
    });

    // Then update the menu with new data and connect new meals
    const result = await db.menu.update({
      where: { id: menuId },
      data: {
        name: menu.name,
        description: menu.description,
        startDate: menu.startDate,
        endDate: menu.endDate,
        orderFrom: menu.orderFrom,
        orderTo: menu.orderTo,
        meals: {
          connect: menu.meals.map((mealId) => ({ id: mealId })),
        },
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Menu update failed",
      };
    }

    return {
      success: true,
      message: "Menu updated successfully",
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "Error updating menu";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
