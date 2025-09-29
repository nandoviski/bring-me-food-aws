"use server";

import type { EditCustomerType } from "../../schema/customer";
import { fakeLoggedUser } from "@/hooks/mock-data";
import { updateCustomer } from "../db/customer";

export async function formSaveAction(customer: EditCustomerType) {
  try {
    const loggedUser = fakeLoggedUser();
    // const saveResult = await db.user.create({
    //   data: { ...user, id: loggedUser.id },
    // });

    // TODO: fix this to update
    const saveResult = undefined; // await updateCustomer(loggedUser.id, customer);

    if (!saveResult) {
      return {
        success: false,
        message: "Failed to save customer data",
      };
    }

    return {
      success: true,
      message: "Customer data saved successfully",
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    } else
      return {
        success: false,
        message: "Error saving customer data",
      };
  }
}

// type FormStateType = {
//   success: boolean;
//   message?: string;
//   errors?: Record<string, string>;
//   inputs?: Record<string, string>;
// };

// export async function formSaveAction(
//   prevState: FormStateType,
//   formData: FormData,
// ) {
//   const rawData = Object.fromEntries(formData.entries());

//   const validatedData = editUserSchema.safeParse(rawData);
//   if (!validatedData.success) {
//     return {
//       sucess: false,
//       message: "Fix the errors in the form",
//       errors: validatedData.error.flatten().fieldErrors,
//       inputs: rawData,
//     };
//   }

//   console.log("Form data", validatedData);
//   const saveResult = await updateUser(
//     validatedData.data.firstName,
//     validatedData.data.lastName,
//   );
//   if (!saveResult) {
//     return {
//       success: false,
//       message: "Failed to save user data",
//       errors: {},
//       inputs: validatedData.data,
//     };
//   }

//   return {
//     success: true,
//     message: "User data saved successfully",
//     errors: {},
//     inputs: validatedData.data,
//   };
// }
