"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditCustomerSchema, type EditCustomerType } from "@/schema";
import { useUpdateCustomerMutation } from "@/state/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type Props = {
  customer: EditCustomerType;
};

export default function EditCustomerForm({ customer }: Props) {
  const { user: loggedUser } = useAuth();

  const form = useForm<z.infer<typeof EditCustomerSchema>>({
    resolver: zodResolver(EditCustomerSchema),
    defaultValues: customer,
  });

  const [mutation] = useUpdateCustomerMutation();

  async function onSubmit(values: z.infer<typeof EditCustomerSchema>) {
    if (!loggedUser) {
      toast.error("No logged in user");
      return;
    }

    const result = await mutation({
      userId: loggedUser.id,
      customer: values,
    });

    if (result.data) {
      toast.success("Success", {
        description: "Customer profile updated successfully",
      });
    } else {
      toast.error("Error", {
        description: "An error occurred while updating customer profile",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-8 py-10"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-9">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="number" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACT">
                        Australian Capital Territory
                      </SelectItem>
                      <SelectItem value="NSW">New South Wales</SelectItem>
                      <SelectItem value="NT">Northern Territory</SelectItem>
                      <SelectItem value="QLD">Queensland</SelectItem>
                      <SelectItem value="SA">South Australia</SelectItem>
                      <SelectItem value="TAS">Tasmania</SelectItem>
                      <SelectItem value="VIC">Victoria</SelectItem>
                      <SelectItem value="WA">Western Australia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-4">
            <FormItem>
              <FormLabel>Country</FormLabel>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                🇦🇺 Australia
              </div>
            </FormItem>
          </div>
        </div>

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

// export default function EditUserForm({ user }: Props) {
//   const [state, action, isLoading] = useActionState(formSaveAction, {
//     success: false,
//     message: "",
//     errors: undefined,
//     inputs: undefined,
//   });

//   console.log("state", state);

//   return (
//     <form
//       action={action}
//       className="mx-auto max-w-3xl space-y-8 divide-y divide-gray-900/10 py-12"
//     >
//       <div className="space-y-12">
//         <div className="border-b border-gray-900/10 pb-12">
//           <h2 className="text-base/7 font-semibold text-gray-900">
//             Personal Information
//           </h2>
//           <p className="mt-1 text-sm/6 text-gray-600">
//             Use a permanent address where you can receive mail.
//           </p>

//           <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
//             <div className="sm:col-span-3">
//               <label
//                 htmlFor="firstName"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 First name
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="firstName"
//                   name="firstName"
//                   type="text"
//                   autoComplete="given-name"
//                   defaultValue={state.inputs?.firstName}
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//                 {state.errors?.firstName && (
//                   <p className="mt-2 text-sm/6 text-red-600">
//                     {state.errors.firstName[0]}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="sm:col-span-3">
//               <label
//                 htmlFor="lastName"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Last name
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="lastName"
//                   name="lastName"
//                   type="text"
//                   defaultValue={state.inputs?.lastName}
//                   autoComplete="family-name"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div className="sm:col-span-4">
//               <label
//                 htmlFor="email"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Email address
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div className="sm:col-span-3">
//               <label
//                 htmlFor="country"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Country
//               </label>
//               <div className="mt-2 grid grid-cols-1">
//                 <select
//                   id="country"
//                   name="country"
//                   autoComplete="country-name"
//                   className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 >
//                   <option>United States</option>
//                   <option>Canada</option>
//                   <option>Mexico</option>
//                 </select>
//                 <ChevronDownIcon
//                   aria-hidden="true"
//                   className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
//                 />
//               </div>
//             </div>

//             <div className="col-span-full">
//               <label
//                 htmlFor="street-address"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Street address
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="street-address"
//                   name="street-address"
//                   type="text"
//                   autoComplete="street-address"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div className="sm:col-span-2 sm:col-start-1">
//               <label
//                 htmlFor="city"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 City
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="city"
//                   name="city"
//                   type="text"
//                   autoComplete="address-level2"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div className="sm:col-span-2">
//               <label
//                 htmlFor="region"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 State / Province
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="region"
//                   name="region"
//                   type="text"
//                   autoComplete="address-level1"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>

//             <div className="sm:col-span-2">
//               <label
//                 htmlFor="postal-code"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 ZIP / Postal code
//               </label>
//               <div className="mt-2">
//                 <input
//                   id="postal-code"
//                   name="postal-code"
//                   type="text"
//                   autoComplete="postal-code"
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-b border-gray-900/10 pb-12">
//           <h2 className="text-base/7 font-semibold text-gray-900">
//             Chef&apos;s Profile
//           </h2>
//           <p className="mt-1 text-sm/6 text-gray-600">
//             This information will be displayed publicly so be careful what you
//             share.
//           </p>

//           <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
//             <div className="sm:col-span-4">
//               <label
//                 htmlFor="username"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Username
//               </label>
//               <div className="mt-2">
//                 <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
//                   <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">
//                     bringmefood.com/
//                   </div>
//                   <input
//                     id="username"
//                     name="username"
//                     type="text"
//                     placeholder="janesmith"
//                     className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="col-span-full">
//               <label
//                 htmlFor="about"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 About
//               </label>
//               <div className="mt-2">
//                 <textarea
//                   id="about"
//                   name="about"
//                   rows={3}
//                   className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                   defaultValue={""}
//                 />
//               </div>
//               <p className="mt-3 text-sm/6 text-gray-600">
//                 Write a few sentences about yourself.
//               </p>
//             </div>

//             <div className="col-span-full">
//               <label
//                 htmlFor="photo"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Photo
//               </label>
//               <div className="mt-2 flex items-center gap-x-3">
//                 <UserCircleIcon
//                   aria-hidden="true"
//                   className="size-12 text-gray-300"
//                 />
//                 <button
//                   type="button"
//                   className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
//                 >
//                   Change
//                 </button>
//               </div>
//             </div>

//             <div className="col-span-full">
//               <label
//                 htmlFor="cover-photo"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Cover photo
//               </label>
//               <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
//                 <div className="text-center">
//                   <ImageIcon
//                     aria-hidden="true"
//                     className="mx-auto size-12 text-gray-300"
//                   />
//                   <div className="mt-4 flex text-sm/6 text-gray-600">
//                     <label
//                       htmlFor="file-upload"
//                       className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-hidden focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
//                     >
//                       <span>Upload a file</span>
//                       <input
//                         id="file-upload"
//                         name="file-upload"
//                         type="file"
//                         className="sr-only"
//                       />
//                     </label>
//                     <p className="pl-1">or drag and drop</p>
//                   </div>
//                   <p className="text-xs/5 text-gray-600">
//                     PNG, JPG, GIF up to 10MB
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* <div className="border-b border-gray-900/10 pb-12">
//       <h2 className="text-base/7 font-semibold text-gray-900">
//         Notifications
//       </h2>
//       <p className="mt-1 text-sm/6 text-gray-600">
//         We&apos;ll always let you know about important changes, but you pick
//         what else you want to hear about.
//       </p>

//       <div className="mt-10 space-y-10">
//         <fieldset>
//           <legend className="text-sm/6 font-semibold text-gray-900">
//             By email
//           </legend>
//           <div className="mt-6 space-y-6">
//             <div className="flex gap-3">
//               <div className="flex h-6 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                   <input
//                     defaultChecked
//                     id="comments"
//                     name="comments"
//                     type="checkbox"
//                     aria-describedby="comments-description"
//                     className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
//                   />
//                   <svg
//                     fill="none"
//                     viewBox="0 0 14 14"
//                     className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
//                   >
//                     <path
//                       d="M3 8L6 11L11 3.5"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-checked:opacity-100"
//                     />
//                     <path
//                       d="M3 7H11"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-indeterminate:opacity-100"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="text-sm/6">
//                 <label
//                   htmlFor="comments"
//                   className="font-medium text-gray-900"
//                 >
//                   Comments
//                 </label>
//                 <p id="comments-description" className="text-gray-500">
//                   Get notified when someones posts a comment on a posting.
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <div className="flex h-6 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                   <input
//                     id="candidates"
//                     name="candidates"
//                     type="checkbox"
//                     aria-describedby="candidates-description"
//                     className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
//                   />
//                   <svg
//                     fill="none"
//                     viewBox="0 0 14 14"
//                     className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
//                   >
//                     <path
//                       d="M3 8L6 11L11 3.5"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-checked:opacity-100"
//                     />
//                     <path
//                       d="M3 7H11"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-indeterminate:opacity-100"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="text-sm/6">
//                 <label
//                   htmlFor="candidates"
//                   className="font-medium text-gray-900"
//                 >
//                   Candidates
//                 </label>
//                 <p id="candidates-description" className="text-gray-500">
//                   Get notified when a candidate applies for a job.
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <div className="flex h-6 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                   <input
//                     id="offers"
//                     name="offers"
//                     type="checkbox"
//                     aria-describedby="offers-description"
//                     className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
//                   />
//                   <svg
//                     fill="none"
//                     viewBox="0 0 14 14"
//                     className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
//                   >
//                     <path
//                       d="M3 8L6 11L11 3.5"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-checked:opacity-100"
//                     />
//                     <path
//                       d="M3 7H11"
//                       strokeWidth={2}
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="opacity-0 group-has-indeterminate:opacity-100"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <div className="text-sm/6">
//                 <label
//                   htmlFor="offers"
//                   className="font-medium text-gray-900"
//                 >
//                   Offers
//                 </label>
//                 <p id="offers-description" className="text-gray-500">
//                   Get notified when a candidate accepts or rejects an offer.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </fieldset>

//         <fieldset>
//           <legend className="text-sm/6 font-semibold text-gray-900">
//             Push notifications
//           </legend>
//           <p className="mt-1 text-sm/6 text-gray-600">
//             These are delivered via SMS to your mobile phone.
//           </p>
//           <div className="mt-6 space-y-6">
//             <div className="flex items-center gap-x-3">
//               <input
//                 defaultChecked
//                 id="push-everything"
//                 name="push-notifications"
//                 type="radio"
//                 className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden not-checked:before:hidden"
//               />
//               <label
//                 htmlFor="push-everything"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Everything
//               </label>
//             </div>
//             <div className="flex items-center gap-x-3">
//               <input
//                 id="push-email"
//                 name="push-notifications"
//                 type="radio"
//                 className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden not-checked:before:hidden"
//               />
//               <label
//                 htmlFor="push-email"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 Same as email
//               </label>
//             </div>
//             <div className="flex items-center gap-x-3">
//               <input
//                 id="push-nothing"
//                 name="push-notifications"
//                 type="radio"
//                 className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden not-checked:before:hidden"
//               />
//               <label
//                 htmlFor="push-nothing"
//                 className="block text-sm/6 font-medium text-gray-900"
//               >
//                 No push notifications
//               </label>
//             </div>
//           </div>
//         </fieldset>
//       </div>
//     </div> */}
//       </div>

//       <div className="mt-6 flex items-center justify-end gap-x-6">
//         <button type="button" className="text-sm/6 font-semibold text-gray-900">
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//         >
//           Save
//         </button>
//       </div>
//     </form>
//   );
// }
