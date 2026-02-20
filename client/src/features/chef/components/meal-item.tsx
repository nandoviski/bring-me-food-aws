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

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== "number") return "0.00";
    return price.toFixed(2);
  };

  return (
    <Card
      key={meal.id}
      className="group overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-56 overflow-hidden">
        
        <Image
          src={
            meal.image && meal.image !== "" ? meal.image : "/placeholder.svg"
          }
          loading={meal.image && meal.image !== "" ? undefined : "eager"}
          alt={`${meal.name} - ${meal.description}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay for text readability if we put text over image, but here we keep it clean */}
        {/* <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" /> */}
      </div>
      
      <CardContent className="flex h-[200px] flex-col justify-between p-6">
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
              className="bg-[#1a2e25] px-6 text-white hover:bg-[#2a4e35]"
              onClick={() => {
                 increaseItemQuantityByMeal(meal);
                 toast.success(`${meal.name} added to cart`, {
                   description: `$${meal.price.toFixed(2)} · tap the cart to checkout`,
                   duration: 2500,
                 });
              }}
           >
              Add
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
