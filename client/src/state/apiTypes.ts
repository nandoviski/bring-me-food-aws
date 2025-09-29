export interface Meal {
  id: string;
  name: string;
  chefId: string;
  description: string;
  price: number;
  size?: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chef {
  username: string;
  id: string;
  userId: string;
  name: string;
  location: string;
  bio?: string;
  specialties?: string;
  phoneNumber?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Menu {
  id: string;
  name: string;
  chefId: string;
  description: string;
  startDate: Date;
  endDate: Date;
  orderFrom?: Date;
  orderTo?: Date;
  createdAt: Date;
  updatedAt: Date;
  meals: Meal[];
}

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
  createdAt: Date;
  updatedAt: Date;
}
