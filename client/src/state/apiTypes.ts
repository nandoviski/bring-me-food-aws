import { Chef } from "@/features/chef/schema/chef";
import { Customer } from "@/features/customer/schema/customer";
import { Meal } from "@/features/meal/schema/meal";

export interface User {
  id: string;
  email: string;
  status: "CREATED" | "ACTIVE" | "INACTIVE";
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  chef?: Chef;
}
