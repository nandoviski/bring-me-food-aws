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
import { EditMealSchema, type EditMealType, type Meal } from "@/schema";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMealMutation,
  useUpdateMealMutation,
  useUploadFileMutation,
} from "@/state/api";
import { useAuth } from "@/lib/auth";

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
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadFileTrigger] = useUploadFileMutation();
  const { user: loggedUser } = useAuth();
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

  if (!loggedUser || !loggedUser.chef) {
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
        setFileToUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<EditMealType> = async (data) => {
    const sanitized = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: Number.parseFloat(data.price),
      size: data.size ? Number.parseInt(data.size) : undefined,
      ingredients: data.ingredients.map((ing) => ing.value),
      allergens: data.allergens.map((all) => all.value),
    } as Meal;

    let imageKey: string | undefined = undefined;

    // If a new file was selected, upload via RTK Query mutation and get key
    if (fileToUpload) {
      try {
        const data = await uploadFileTrigger({
          file: fileToUpload,
          userId: loggedUser.id,
        }).unwrap();
        imageKey = data.key;
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload image. Please try again.");
        return;
      }
    } else {
      // No new file. If editing and original image unchanged, reuse it; otherwise leave undefined
      if (mealId && initialData?.image && initialData.image === data.image) {
        // We stored original final URL in initialData.image; if server expects key, client could send the final URL
        // We'll send the final URL — server will use it as-is (promotion not needed)
        sanitized.image = initialData.image;
      } else if (
        !mealId &&
        data.image &&
        !data.image.startsWith("/placeholder.svg")
      ) {
        // New meal but user pasted an image data URL (unlikely) — ignore or handle separately
        sanitized.image = undefined;
      }
    }

    if (imageKey) sanitized.image = imageKey;

    try {
      if (mealId) {
        await triggerUpdate({ mealId, meal: sanitized }).unwrap();
      } else {
        await triggerCreate({
          ...sanitized,
          chefId: loggedUser.chef.id,
        }).unwrap();
      }

      toast.success(mealId ? "Meal updated" : "Meal saved", {
        description: `Meal ${data.name} has been ${mealId ? "updated" : "added"} successfully.`,
      });

      if (!mealId) {
        form.reset();
        setImagePreview("/placeholder.svg?height=200&width=200");
      }
      onMealAdded?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(mealId ? "Error updating meal" : "Error saving meal", {
        description: `There was an error ${mealId ? "updating" : "adding"} the meal. Please try again.`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Basic Information
          </h2>
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
              <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-slate-100">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Meal preview"
                      className="h-full w-full object-cover"
                      unoptimized
                      width={200}
                      height={200}
                    />
                  </div>
                  <div className="border-t border-slate-200 bg-white p-3">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Description
          </h2>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell customers about your meal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your meal, its flavors, cooking method, and any special touches..."
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ingredients Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Ingredients
            </h2>
            <span className="text-sm text-muted-foreground">
              {ingredientFields.length} ingredient{ingredientFields.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Card className="border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-3">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="e.g., Fresh tomatoes, Extra virgin olive oil"
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
                    onClick={() => removeIngredient(index)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => appendIngredient({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
          </Card>
        </div>

        {/* Allergens Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Allergens
            </h2>
            <span className="text-sm text-muted-foreground">
              {allergenFields.length} allergen{allergenFields.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Card className="border border-yellow-200 bg-yellow-50 p-4">
            <div className="space-y-3">
              {allergenFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`allergens.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="e.g., Dairy, Gluten, Tree Nuts"
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
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => appendAllergen({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Allergen
              </Button>
            </div>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mealId ? "Updating..." : "Adding..."}
              </>
            ) : (
              mealId ? "Update Meal" : "Add Meal"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
