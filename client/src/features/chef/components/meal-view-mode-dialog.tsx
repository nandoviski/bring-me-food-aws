import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Meal } from "@/schema";
import { Utensils, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";

type Props = {
  meal: Meal;
};

export default function MealViewModeDialog({ meal }: Props) {
  const { getItemQuantity, increaseItemQuantityByMeal, decreaseItemQuantity } =
    useShoppingCart();

  const formatPrice = (price: number) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  function getTotal(mealId?: string, price?: number) {
    if (!mealId) return formatPrice(0);

    const quantities = getItemQuantity(mealId);
    const total = (quantities ?? 1) * (price ?? 0);
    return formatPrice(total);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          View More
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meal.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="relative h-[300px] overflow-hidden rounded-lg">
            <Image
              src={
                meal?.image && meal.image !== ""
                  ? meal.image
                  : "/placeholder.svg"
              }
              alt={`Detailed view of ${meal.name}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">{meal.description}</p>

            {meal.ingredients.length > 0 && (
              <div className="flex items-center gap-1">
                <Utensils className="h-4 w-4" />
                <span>{meal.ingredients.join(", ")}</span>
              </div>
            )}
            {meal.allergens.length > 0 && (
              <div className="flex items-center gap-1">
                <p className="font-bold">Allergens: </p>
                <span>{meal.allergens[0]}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <span className="font-semibold">Price per serving:</span>
              <span className="text-lg font-bold text-orange-600">
                ${formatPrice(meal.price)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => decreaseItemQuantity(meal.id!)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={getItemQuantity(meal.id!)}
                  className="mx-2 h-8 w-16 text-center"
                  aria-label="Quantity"
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => increaseItemQuantityByMeal(meal)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-orange-600">
                  $ {getTotal(meal.id, meal.price)}
                </span>
              </div>
              {/* <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => increaseItemQuantityByMeal(meal)}
              >
                Add to Order
              </Button> */}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="mb-4 font-semibold">Reviews</h3>
          {/* <ReviewList mealId={meal.mealId} /> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
