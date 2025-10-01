"use client";

import type React from "react";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EditMealSchema, type EditMealType } from "../schema/meal";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMealMutation, useUpdateMealMutation } from "@/state/api";
import { fakeLoggedUser } from "@/hooks/mock-data";

interface Props {
  onOpenChange: (open: boolean) => void;
  onMealAdded?: () => void;
  initialData?: EditMealType;
  mealId?: string;
}

export default function AddMealForm({
  onOpenChange,
  onMealAdded,
  initialData,
  mealId,
}: Props) {
  const [imagePreview, setImagePreview] = useState(
    initialData?.image ?? "/placeholder.svg?height=200&width=200",
  );
  const loggedUser = fakeLoggedUser();

  console.log("mealId", mealId);
  console.log("loggedUser?.id", loggedUser?.id);
  //mealId 5f0b1749-f71c-41bf-a971-4ec8349694d1
  //loggedUser?.id 879c31a3-5354-49ed-be60-8ab4b00c9537

  const [triggerUpdate, { isLoading: isUpdating }] = useUpdateMealMutation();
  const [triggerCreate, { isLoading: isCreating }] = useCreateMealMutation();

  // Initialize the form
  const form = useForm<EditMealType>({
    resolver: zodResolver(EditMealSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      price: "",
      ingredients: [],
      allergens: [],
      image: "/placeholder.svg?height=200&width=200",
    },
  });

  // Setup field arrays for ingredients and allergens
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: allergenFields,
    append: appendAllergen,
    remove: removeAllergen,
  } = useFieldArray({
    control: form.control,
    name: "allergens",
  });

  if (!loggedUser.chef) {
    return <div>You must be logged in as a chef to add or edit meals.</div>;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<EditMealType> = async (data) => {
    const dataSanitized = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: Number.parseFloat(data.price as unknown as string),
      size: data.size ? Number.parseInt(data.size) : undefined,
      ingredients: data.ingredients.map((ing) => ing.value),
      allergens: data.allergens.map((all) => all.value),
      image: data.image?.startsWith("/placeholder.svg")
        ? undefined
        : data.image,
    };

    const result = mealId
      ? await triggerUpdate({ mealId, meal: dataSanitized })
      : await triggerCreate({ ...dataSanitized, chefId: loggedUser.chef?.id });

    if (result.data) {
      toast.success(mealId ? "Meal updated" : "Meal saved", {
        description: `Meal ${data.name} has been ${mealId ? "updated" : "added"} successfully.`,
      });
      if (!mealId) {
        form.reset();
        setImagePreview("/placeholder.svg?height=200&width=200");
      }
      onMealAdded?.();
      onOpenChange(false);
    } else {
      toast.error(mealId ? "Error updating meal" : "Error saving meal", {
        description: `There was an error ${mealId ? "updating" : "adding"} the meal. Please try again.`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Homemade Lasagna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="12.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="300">300g</SelectItem>
                      <SelectItem value="500" defaultChecked>
                        500g
                      </SelectItem>
                      <SelectItem value="750">750g</SelectItem>
                      <SelectItem value="1000">1kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Meal Image</Label>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Meal preview"
                    className="h-full w-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="p-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your meal..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Ingredients</Label>
          <div className="space-y-2">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`ingredients.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Ingredient" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredientFields.length === 0}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendIngredient({ value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Allergens</Label>
          <div className="space-y-2">
            {allergenFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`allergens.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Allergen (e.g., Dairy, Gluten, Nuts)"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeAllergen(index)}
                  disabled={allergenFields.length === 0}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendAllergen({ value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Allergen
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isCreating || isUpdating}
        >
          {mealId ? "Update Meal" : "Add Meal"}
        </Button>
      </form>
    </Form>
  );
}
