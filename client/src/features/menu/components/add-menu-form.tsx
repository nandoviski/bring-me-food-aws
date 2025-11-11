"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditMenuSchema, type EditMenuType } from "@/schema";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Search } from "lucide-react";
import { useGetMealsByChefQuery } from "@/state/api";
import { useCreateMenuMutation, useUpdateMenuMutation } from "@/state/api";
import { useAuth } from "@/lib/auth";

interface Props {
  onOpenChange: (open: boolean) => void;
  onMenuAdded?: () => void;
  initialData?: EditMenuType;
  menuId?: string;
}

export default function AddMenuForm({
  onOpenChange,
  onMenuAdded,
  initialData,
  menuId,
}: Props) {
  const { user: loggedUser } = useAuth();
  const { data: meals } = useGetMealsByChefQuery({
    chefId: loggedUser?.chef?.id ?? "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [triggerUpdate, { isLoading: isUpdating }] = useUpdateMenuMutation();
  const [triggerCreate, { isLoading: isCreating }] = useCreateMenuMutation();

  const form = useForm<EditMenuType>({
    resolver: zodResolver(EditMenuSchema),
    defaultValues: (() => {
      const baseDefaults: EditMenuType = {
        name: "",
        description: "",
        startDate: new Date(),
        endDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          return date;
        })(),
        meals: [],
      };

      if (!initialData) return baseDefaults;

      // Helper to coerce a value to Date if possible
      const toDate = (v: any) => {
        if (!v) return undefined;
        if (v instanceof Date) return v;

        const parsed = new Date(v);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      };

      return {
        ...baseDefaults,
        ...initialData,
        startDate: toDate(initialData.startDate) ?? baseDefaults.startDate,
        endDate: toDate(initialData.endDate) ?? baseDefaults.endDate,
      } as EditMenuType;
    })(),
  });

  if (!loggedUser || !loggedUser.chef) {
    return <div>You must be logged in as a chef to add or edit meals.</div>;
  }

  const onSubmit: SubmitHandler<EditMenuType> = async (data) => {
    const dataSanitized = {
      ...data,
      chefId: loggedUser.chef?.id,
      meals: data.meals || [],
    };

    const result = menuId
      ? await triggerUpdate({ menuId, menu: dataSanitized })
      : await triggerCreate(dataSanitized);

    if (result.data) {
      toast.success(menuId ? "Menu updated" : "Menu created", {
        description: `The menu has been successfully ${menuId ? "updated" : "created"}.`,
      });
      onMenuAdded?.();
      onOpenChange(false);
    } else {
      toast.error(menuId ? "Error updating menu" : "Error creating menu", {
        description: "An error occurred. Please try again.",
      });
    }
  };

  const filteredMeals = meals
    ? meals.filter((meal) =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu Name</FormLabel>
              <FormControl>
                <Input placeholder="Italian Week" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A week of authentic Italian dishes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? format(field.value, "yyyy-MM-dd")
                        : format(new Date(field.value), "yyyy-MM-dd")
                    }
                    onChange={(e) => {
                      const dateValue = new Date(e.target.value + "T00:00:00");
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? format(field.value, "yyyy-MM-dd")
                        : (() => {
                            try {
                              const d = new Date(field.value);
                              return isNaN(d.getTime())
                                ? ""
                                : format(d, "yyyy-MM-dd");
                            } catch {
                              return "";
                            }
                          })()
                    }
                    onChange={(e) => {
                      const dateValue = new Date(e.target.value + "T00:00:00");
                      field.onChange(dateValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Select Meals</FormLabel>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeals.length > 0 &&
                  filteredMeals.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name="meals"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value?.includes(meal.id!)}
                              onCheckedChange={(checked) => {
                                const updatedMeals = checked
                                  ? [...field.value, meal.id]
                                  : field.value.filter((id) => id !== meal.id);
                                field.onChange(updatedMeals);
                              }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              meal.image && meal.image !== ""
                                ? meal.image
                                : "/placeholder.svg"
                            }
                            alt={meal.name}
                            unoptimized
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{meal.name}</span>
                            <span className="text-muted-foreground line-clamp-1 text-xs">
                              {meal.description}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${meal.price.toFixed(2)}</TableCell>
                      <TableCell>{meal.size}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-2">
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
            {menuId ? "Update Menu" : "Create Menu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
