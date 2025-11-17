"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditChefSchema, type EditChefType } from "@/schema";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { useAuth } from "@/lib/auth";
import { useUpdateChefMutation } from "@/state/api";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

type Props = {
  chef: EditChefType;
};

export default function EditChefForm({ chef }: Props) {
  const form = useForm<EditChefType>({
    resolver: zodResolver(EditChefSchema),
    defaultValues: chef,
  });

  const [chefFormSaveAction] = useUpdateChefMutation();

  const { check, status: usernameStatus } = useUsernameCheck();

  async function handleUsernameBlur(value?: string) {
    const username = (value ?? form.getValues("username") ?? "").trim();

    if (username === (chef?.username ?? "")) {
      form.clearErrors("username");
      return;
    }

    if (!username) {
      form.clearErrors("username");
      return;
    }

    const res = await check(username);
    if (res.exists) {
      form.setError("username", {
        type: "manual",
        message: "Username already taken",
      });
    } else {
      form.clearErrors("username");
    }
  }

  async function onSubmit(values: EditChefType) {
    const { user: loggedChef } = useAuth();

    const payload = { ...values } as any;
    if (payload.username && typeof payload.username === "string") {
      payload.username = payload.username.toLowerCase().trim();
    }

    if (!loggedChef) {
      toast.error("No logged in user");
      return;
    }

    const result = await chefFormSaveAction({
      chefId: loggedChef.id,
      chef: payload,
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
    <MainPageWithHeader
      title="Edit Chef Profile"
      description="Update your chef details"
    >
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
                    <Input
                      id="username"
                      {...field}
                      type="text"
                      onBlur={() => {
                        field.onBlur();
                        handleUsernameBlur();
                      }}
                    />
                  </FormControl>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                      <span className="select-all">
                        https://www.bringmefood.com.au/chef/
                      </span>
                      <span
                        className="ml-1 font-medium text-gray-800"
                        role="status"
                        aria-live="polite"
                      >
                        {field.value ?? ""}
                      </span>

                      <span className="ml-3 text-sm" aria-hidden>
                        {usernameStatus === "checking" && (
                          <span className="text-gray-500">Checking…</span>
                        )}
                        {usernameStatus === "available" && (
                          <span className="text-green-600">Available</span>
                        )}
                        {usernameStatus === "taken" && (
                          <span className="text-red-600">Taken</span>
                        )}
                        {usernameStatus === "error" && (
                          <span className="text-yellow-600">Check failed</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="inline-flex items-center px-3 py-1 text-sm"
                        onClick={async () => {
                          const username = field.value ?? "";
                          const fullUrl = `https://www.bringmefood.com.au/chef/${username}`;
                          try {
                            if (!username) return;
                            await navigator.clipboard.writeText(fullUrl);
                            toast.success("Copied URL to clipboard", {
                              description: fullUrl,
                            });
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to copy URL");
                          }
                        }}
                        disabled={!field.value}
                        aria-label={
                          field.value
                            ? "Copy public chef URL to clipboard"
                            : "Enter username to enable copy"
                        }
                        title={
                          field.value
                            ? "Copy public chef URL"
                            : "Enter username to enable copy"
                        }
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy link
                      </Button>
                    </div>
                  </div>

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
    </MainPageWithHeader>
  );
}
