import type { Chef } from "./chef";
import type { Customer } from "./customer";

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
