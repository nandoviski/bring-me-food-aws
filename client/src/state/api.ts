// https://youtu.be/KAV8vo7hGAo?si=JrZwwP3ZvGf7EiBo
// create Project endpoints 2:55 - 3:05

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Chef, Customer, Meal, Menu } from "./apiTypes";
// import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: [
    "Meals",
    "Chefs",
    "ChefByUsername",
    "ChefsWeeklyMenu",
    "ChefByUserId",
    "Customers",
    "MealsByChef",
  ],
  endpoints: (build) => ({
    // Meals
    getMeals: build.query<Meal[], void>({
      query: () => "meals",
      providesTags: ["Meals"],
    }),
    createMeal: build.mutation<Meal, Partial<Meal>>({
      query: (meal) => ({
        url: "meals",
        method: "POST",
        body: meal,
      }),
      invalidatesTags: ["Meals", "MealsByChef"],
    }),
    updateMeal: build.mutation<Meal, { mealId: string; meal: Partial<Meal> }>({
      query: ({ meal, mealId }) => ({
        url: `meals/${mealId}`,
        method: "PUT",
        body: meal,
      }),
      invalidatesTags: ["Meals", "MealsByChef"],
    }),
    getMealsByChef: build.query<Meal[], { chefId: string }>({
      query: ({ chefId }) => `meals/${chefId}/byChef`,
      providesTags: ["MealsByChef"],
    }),

    // Chefs
    updateChef: build.mutation<
      boolean,
      { chefId: string; chef: Partial<Chef> }
    >({
      query: ({ chefId, chef }) => ({
        url: `chefs/${chefId}`,
        method: "PUT",
        body: chef,
      }),
      invalidatesTags: ["Chefs"],
    }),
    getChefByUsername: build.query<Chef, { username: string }>({
      query: ({ username }) => `chefs/${username}/profile`,
      providesTags: ["ChefByUsername"],
    }),
    getChefsWeeklyMenu: build.query<Menu, { chefId: string }>({
      query: ({ chefId }) => `chefs/${chefId}/menu`,
      providesTags: ["ChefsWeeklyMenu"],
    }),
    getChefByUserId: build.query<Chef, { userId: string }>({
      query: ({ userId }) => `chefs/byUserId/${userId}`,
      providesTags: ["ChefByUserId"],
    }),

    // Customers
    getCustomer: build.query<Customer, { userId: string }>({
      query: ({ userId }) => `customers/${userId}`,
      providesTags: ["Customers"],
    }),
    updateCustomer: build.mutation<
      boolean,
      { userId: string; customer: Partial<Customer> }
    >({
      query: ({ userId, customer }) => ({
        url: `customers/${userId}`,
        method: "PUT",
        body: customer,
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetMealsQuery,
  useCreateMealMutation,
  useUpdateMealMutation,
  useGetMealsByChefQuery,
  useGetChefByUsernameQuery,
  useUpdateChefMutation,
  useGetChefsWeeklyMenuQuery,
  useLazyGetChefsWeeklyMenuQuery,
  useGetChefByUserIdQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} = api;
