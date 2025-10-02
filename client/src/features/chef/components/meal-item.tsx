import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Meal } from "@/features/meal/schema/meal";
import { Utensils } from "lucide-react";
import Image from "next/image";
import MealViewModeDialog from "./meal-view-mode-dialog";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";

export default function MealItem({ meal }: { meal: Meal }) {
  const { increaseItemQuantityByMeal } = useShoppingCart();

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  return (
    <Card
      key={meal.id}
      className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative h-48">
        <Image
          src={
            meal.image && meal.image !== "" ? meal.image : "/placeholder.svg"
          }
          alt={`${meal.name} - ${meal.description}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <CardContent className="relative -mt-20 bg-white/95 p-6 backdrop-blur-xs">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {meal.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{meal.description}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                {meal.ingredients.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Utensils className="h-4 w-4" />
                    <span>{meal.ingredients.join(", ")}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                {meal.allergens.length > 0 && (
                  <div className="flex items-center gap-1">
                    <p className="font-bold">Allergens: </p>
                    <span>{meal.allergens[0]}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">
                ${formatPrice(meal.price)}
              </div>
              {/* {meal.available ? (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Available
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                Sold Out
              </span>
            )} */}
            </div>
          </div>

          <MealViewModeDialog meal={meal} />

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                increaseItemQuantityByMeal(meal);
              }}
            >
              Quick Order
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
