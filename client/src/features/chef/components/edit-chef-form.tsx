"use client";

import { useForm } from "react-hook-form";
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
import { EditChefSchema, type EditChefType } from "../schema/chef";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { useUpdateChefMutation } from "@/state/api";

type Props = {
  chef: EditChefType;
};

export default function EditChefForm({ chef }: Props) {
  const form = useForm<EditChefType>({
    resolver: zodResolver(EditChefSchema),
    defaultValues: chef,
  });

  const [chefFormSaveAction] = useUpdateChefMutation();

  async function onSubmit(values: EditChefType) {
    const loggedChef = fakeLoggedUser();
    const result = await chefFormSaveAction({
      chefId: loggedChef.id,
      chef: values,
    });

    if (result.data) {
      toast.success("Chef saved", {
        description: "Chef profile updated successfully",
      });
    } else {
      toast.error("Error", {
        description: "An error occurred while updating chef profile",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        <div>
          <h1>Sample banner here</h1>
        </div>
        <div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="flex items-center rounded-md pl-3">
                    <Label htmlFor="username">
                      https://www.bringmefood.com.au/chef/
                    </Label>
                    <Input {...field} type="text" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Sydney - NSW"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="" {...field} required={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="specialties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialties</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: Italian;French;Asian"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
