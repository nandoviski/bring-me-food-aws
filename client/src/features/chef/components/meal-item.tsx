import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Meal } from "@/schema";
import { Utensils } from "lucide-react";
import Image from "next/image";
import MealViewModeDialog from "./meal-view-mode-dialog";
import { useShoppingCart } from "@/features/shopping-cart/context/shoppingCartContext";
import { toast } from "sonner";

type Props = {
  meal: Meal;
};

export default function MealItem({ meal }: Props) {
  const { increaseItemQuantityByMeal } = useShoppingCart();
  const soldOut = meal.remainingStock !== null && meal.remainingStock !== undefined && meal.remainingStock <= 0;
  const lowStock = !soldOut && meal.remainingStock !== null && meal.remainingStock !== undefined && meal.remainingStock <= 5;

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  return (
    <Card
      key={meal.id}
      className="group overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden sm:h-56">
        
        <Image
          src={
            meal.image && meal.image !== "" ? meal.image : "/placeholder.svg"
          }
          loading={meal.image && meal.image !== "" ? undefined : "eager"}
          alt={`${meal.name} - ${meal.description}`}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-110 ${soldOut ? "grayscale opacity-70" : ""}`}
        />
        {/* Stock badges */}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/80 px-4 py-1.5 text-sm font-semibold text-white">
              Sold Out
            </span>
          </div>
        )}
        {lowStock && !soldOut && (
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-semibold text-white">
              Only {meal.remainingStock} left!
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="flex min-h-[180px] flex-col justify-between p-4 sm:p-6">
        <div>
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-serif text-xl font-medium text-[#1a2e25] line-clamp-1">
              {meal.name}
            </h3>
            <span className="text-lg font-semibold text-orange-600">
              ${formatPrice(meal.price)}
            </span>
          </div>
          
          <p className="mb-4 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {meal.description}
          </p>

          <div className="flex flex-wrap gap-2">
             {meal.ingredients.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                   <Utensils className="h-3 w-3" />
                   <span className="line-clamp-1">{meal.ingredients.join(", ")}</span>
                </div>
             )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
           <div className="flex-1">
              <MealViewModeDialog meal={meal} />
           </div>
           <Button
              size="sm"
              disabled={soldOut}
              className={soldOut ? "px-6 bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#1a2e25] px-6 text-white hover:bg-[#2a4e35]"}
              onClick={() => {
                if (soldOut) return;
                increaseItemQuantityByMeal(meal);
                toast.success(`${meal.name} added to cart`, {
                  description: `$${meal.price.toFixed(2)} · tap the cart to checkout`,
                  duration: 2500,
                });
              }}
           >
              {soldOut ? "Sold out" : "Add"}
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
