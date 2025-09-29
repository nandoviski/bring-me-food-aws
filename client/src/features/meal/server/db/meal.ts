"use server";

import { loggedChefId } from "@/lib/authUtils";
import { db } from "@/server/db";
import { type EditMealType } from "../../schema/meal";

export async function getMealsByChef() {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  return await db.meal.findMany({
    where: { chefId },
    orderBy: { name: "asc" },
  });
}

export async function addMealToChef(meal: EditMealType) {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  try {
    const newMeal = {
      ...meal,
      price: parseFloat(meal.price),
      size: meal.size ? parseInt(meal.size) : null,
      chefId,
      ingredients: meal.ingredients.map((ingredient) => ingredient.value),
      allergens: meal.allergens.map((allergen) => allergen.value),
    };

    const result = await db.meal.create({
      data: newMeal,
    });

    if (!result) {
      return {
        success: false,
        message: "Meal creation failed",
      };
    }

    return {
      success: true,
      message: "Meal created successfully",
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "Error creating meal";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function updateMeal(mealId: string, meal: EditMealType) {
  const chefId = await loggedChefId();

  if (!chefId) {
    throw new Error("Chef ID is required");
  }

  try {
    const updatedMeal = {
      ...meal,
      price: parseFloat(meal.price),
      size: meal.size ? parseInt(meal.size) : null,
      ingredients: cleanArray(meal.ingredients),
      allergens: cleanArray(meal.allergens),
    };

    const result = await db.meal.update({
      where: { id: mealId, chefId },
      data: updatedMeal,
    });

    if (!result) {
      return {
        success: false,
        message: "Meal update failed",
      };
    }

    return {
      success: true,
      message: "Meal updated successfully",
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "Error updating meal";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

function cleanArray(array: { value: string }[]) {
  const result = array.filter((item) => item?.value?.trim());

  if (result.length === 0) {
    return [];
  }
  return result.map((item) => item.value);
}
