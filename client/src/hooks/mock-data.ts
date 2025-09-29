import type { User, Customer, Chef } from "@/state/apiTypes";

export function fakeLoggedUser() {
  //return userCustomer;
  return userChef;
}

type UserComplete = User & { customer?: Customer } & { chef?: Chef };

// -- Mock data for Customer profile --

const customer: Customer = {
  id: "",
  firstName: "Fernando",
  lastName: "Marostega",
  address: "123 Main St",
  city: "Rhodes",
  state: "NSW",
  country: "AU",
  postalCode: "2000",
  phoneNumber: "0455555555",
  company: null,
  userId: "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
  deletedAt: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userCustomer: UserComplete = {
  id: "eacc7be0-860d-450e-a4d4-4b069fb9cd47",
  email: "fmarostega@gmail.com",
  status: "CREATED",
  deletedAt: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: customer,
};

// -- Mock data for Chef profile --

const chefProfile: Chef = {
  id: "d6a8e654-a4ee-4c45-8f3b-11f037981496",
  username: "sarah_kitchen",
  name: "My Home Kitchen",
  location: "Burwood, NSW",
  bio: "I am a chef with 10 years of experience in the kitchen. I love to cook and share my passion for food with others.",
  specialties: "Italian, French, Asian",
  phoneNumber: "0466666666",
  userId: "879c31a3-5354-49ed-be60-8ab4b00c9537",
  deletedAt: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userChef: UserComplete = {
  id: "879c31a3-5354-49ed-be60-8ab4b00c9537",
  email: "sarah@example.com",
  status: "CREATED",
  deletedAt: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  chef: chefProfile,
};
