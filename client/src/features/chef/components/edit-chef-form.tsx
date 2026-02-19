"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Copy, Camera } from "lucide-react";
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
import { useUpdateChefMutation, useUploadFileMutation } from "@/state/api";
import Image from "next/image";

type Props = {
  chef: EditChefType;
};

export default function EditChefForm({ chef }: Props) {
  const { user: loggedUser } = useAuth();
  const form = useForm<EditChefType>({
    resolver: zodResolver(EditChefSchema),
    defaultValues: chef,
  });

  const [chefFormSaveAction, { isLoading: isSaving }] = useUpdateChefMutation();
  const [uploadFileTrigger, { isLoading: isUploading }] = useUploadFileMutation();
  const { check, status: usernameStatus } = useUsernameCheck();

  // Profile image state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(chef.profileImage ?? null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileToUpload(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

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
    if (!loggedUser) {
      toast.error("No logged in user");
      return;
    }

    const payload = { ...values } as EditChefType;
    if (payload.username && typeof payload.username === "string") {
      payload.username = payload.username.toLowerCase().trim();
    }

    // Upload profile image if a new file was selected
    let profileImageKey: string | undefined;
    if (fileToUpload) {
      try {
        const uploaded = await uploadFileTrigger({
          file: fileToUpload,
          userId: loggedUser.id,
        }).unwrap();
        profileImageKey = uploaded.key;
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload profile image");
        return;
      }
    }

    const result = await chefFormSaveAction({
      chefId: loggedUser.chef!.id,
      chef: { ...payload, profileImageKey },
    });

    if (result.data) {
      toast.success("Profile saved");
    } else {
      toast.error("An error occurred while updating your profile");
    }
  }

  const initials = (chef.name ?? "?")[0].toUpperCase();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        {/* Profile image */}
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-3xl font-bold text-white">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50"
              title="Change profile photo"
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Profile photo</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-orange-500 hover:underline"
            >
              {previewUrl ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-0.5 text-xs text-gray-400">JPG or PNG, max 5 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

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
                  <span className="select-all">bringmefood.app/chef/</span>
                  <span className="ml-1 font-medium text-gray-800" role="status">
                    {field.value ?? ""}
                  </span>
                  <span className="ml-3 text-sm">
                    {usernameStatus === "checking" && <span className="text-gray-500">Checking…</span>}
                    {usernameStatus === "available" && <span className="text-green-600">Available</span>}
                    {usernameStatus === "taken" && <span className="text-red-600">Taken</span>}
                    {usernameStatus === "error" && <span className="text-yellow-600">Check failed</span>}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="inline-flex items-center px-3 py-1 text-sm"
                  onClick={async () => {
                    const username = field.value ?? "";
                    const fullUrl = `https://bringmefood.app/chef/${username}`;
                    if (!username) return;
                    try {
                      await navigator.clipboard.writeText(fullUrl);
                      toast.success("Copied URL to clipboard");
                    } catch {
                      toast.error("Failed to copy URL");
                    }
                  }}
                  disabled={!field.value}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </Button>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business / Chef Name</FormLabel>
              <FormControl>
                <Input placeholder="Nonna's Kitchen" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Sydney, NSW" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number <span className="text-gray-400 font-normal">(optional — shown to chef only)</span></FormLabel>
              <FormControl>
                <Input placeholder="0400 000 000" type="tel" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about yourself, your cooking style, or your specialties…"
                  {...field}
                  value={field.value ?? ""}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialties <span className="text-gray-400 font-normal">(comma or semicolon separated)</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Italian, Pasta, Gluten-free"
                  type="text"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSaving || isUploading}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isUploading ? "Uploading photo…" : isSaving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </Form>
  );
}
