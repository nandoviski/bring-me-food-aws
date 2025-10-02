import { z } from "zod";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  company?: string | null;
  userId: string;
  deletedAt?: Date | null;
  // createdAt: Date;
  // updatedAt: Date;
}

export type EditCustomerType = z.infer<typeof EditCustomerSchema>;
export const EditCustomerSchema = z.object({
  firstName: z.string({ message: "First name is required" }).max(150),
  lastName: z.string({ message: "Last name is required" }).max(150),
  phoneNumber: z.string().min(10).max(10),
  address: z.string({ message: "Address is required" }).max(250),
  city: z.string({ message: "City is required" }).max(100),
  state: z.string().min(2).max(3),
  country: z.string().max(3),
  postalCode: z.string().min(4).max(4),
  company: z.string().max(150).optional().nullable(),
});
