"use server";

import { db } from "@/server/db";
import { type EditCustomerType } from "../../schema/customer";

export async function getCustomer(userId: string) {
  return await db.user.findFirst({
    where: { id: userId },
    include: {
      customer: true,
    },
  });
}

export async function updateCustomer(
  userId: string,
  customer: EditCustomerType,
) {
  return await db.customer.update({
    where: { userId },
    data: { ...customer },
  });
}
