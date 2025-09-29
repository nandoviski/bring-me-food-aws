"use server";

// import { db } from "@/server/db";
import { type EditCustomerType } from "../../schema/customer";

export async function getCustomer(userId: string) {
  // TODO: fix this
  // return await db.user.findFirst({
  //   where: { id: userId },
  //   include: {
  //     customer: true,
  //   },
  // });

  return {
    id: "dasd",
    customer: {
      id: userId,
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "123-456-7890",
      address: "123 Main St, City, Country",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId,
    },
  };
}

export async function updateCustomer(
  userId: string,
  customer: EditCustomerType,
) {
  // TODO: fix this
  return undefined;

  // return await db.customer.update({
  //   where: { userId },
  //   data: { ...customer },
  // });
}
