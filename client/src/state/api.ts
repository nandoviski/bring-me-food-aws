// https://youtu.be/KAV8vo7hGAo?si=JrZwwP3ZvGf7EiBo
// create Project endpoints 2:55 - 3:05

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Chef,
  Customer,
  Meal,
  Menu,
  CreateEditMenu,
  OrderCreate,
  Order,
  SignUpType,
} from "@/schema";

export type ChefStats = {
  revenueThisWeek: number;
  revenueChange: number | null;
  ordersThisWeek: number;
  ordersChange: number | null;
  activeMeals: number;
  pendingOrders: number;
  uniqueCustomersThisWeek: number;
  customersChange: number | null;
};
// import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Add authorization token from localStorage if available
      const token = localStorage.getItem("bmf_access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "MealsByChef",
    "MenusByChef",
    "Chefs",
    "ChefByUsername",
    "ChefsWeeklyMenu",
    "ChefByUserId",
    "Customers",
    "OrdersByChef",
    "Subscribers",
  ],
  endpoints: (build) => ({
    // Meals
    createMeal: build.mutation<Meal, Partial<Meal>>({
      query: (meal) => ({
        url: "meals",
        method: "POST",
        body: meal,
      }),
      invalidatesTags: ["MealsByChef"],
    }),
    updateMeal: build.mutation<Meal, { mealId: string; meal: Partial<Meal> }>({
      query: ({ meal, mealId }) => ({
        url: `meals/${mealId}`,
        method: "PUT",
        body: meal,
      }),
      invalidatesTags: ["MealsByChef"],
    }),
    getMealsByChef: build.query<Meal[], { chefId: string }>({
      query: ({ chefId }) => `meals/${chefId}/byChef`,
      providesTags: ["MealsByChef"],
    }),

    // Menus
    createMenu: build.mutation<Menu, Partial<CreateEditMenu>>({
      query: (menu) => ({
        url: "menus",
        method: "POST",
        body: menu,
      }),
      invalidatesTags: ["MenusByChef"],
    }),
    updateMenu: build.mutation<
      Menu,
      { menuId: string; menu: Partial<CreateEditMenu> }
    >({
      query: ({ menu, menuId }) => ({
        url: `menus/${menuId}`,
        method: "PUT",
        body: menu,
      }),
      invalidatesTags: ["MenusByChef"],
    }),
    deleteMenu: build.mutation<Menu, string>({
      query: (menuId) => ({
        url: `menus/${menuId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MenusByChef"],
    }),
    getMenusByChef: build.query<Menu[], { chefId: string; filter?: string }>({
      query: ({ chefId, filter }) => `menus/${chefId}/byChef?filter=${filter}`,
      providesTags: ["MenusByChef"],
    }),

    // Chefs
    updateChef: build.mutation<
      boolean,
      { chefId: string; chef: Partial<Chef> & { profileImageKey?: string } }
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
    getUsernameExists: build.query<{ exists: boolean }, { username: string }>({
      query: ({ username }) => `chefs/${username}/exists`,
      // Keep a short cache to avoid rechecking immediately
      keepUnusedDataFor: 60,
    }),
    getChefsWeeklyMenu: build.query<Menu, { chefId: string }>({
      query: ({ chefId }) => `chefs/${chefId}/menu`,
      providesTags: ["ChefsWeeklyMenu"],
    }),
    getChefByUserId: build.query<Chef, { userId: string }>({
      query: ({ userId }) => `chefs/byUserId/${userId}`,
      providesTags: ["ChefByUserId"],
    }),
    getChefStats: build.query<ChefStats, { chefId: string }>({
      query: ({ chefId }) => `chefs/${chefId}/stats`,
      providesTags: ["Chefs"],
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
    uploadFile: build.mutation<
      { key: string; publicUrl: string },
      { file: File; userId: string }
    >({
      async queryFn(arg) {
        try {
          const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
            /\/$/,
            "",
          );
          const presignUrl = `${base}/upload/presign`;

          const presignResp = await fetch(presignUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentType: arg.file.type,
              userId: arg.userId,
            }),
          });

          if (!presignResp.ok) {
            const text = await presignResp.text();
            return { error: { status: presignResp.status, data: text } as any };
          }

          const { url, key, publicUrl } = await presignResp.json();

          const putResp = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": arg.file.type },
            body: arg.file,
          });

          if (!putResp.ok) {
            const text = await putResp.text();
            return { error: { status: putResp.status, data: text } as any };
          }

          return { data: { key, publicUrl } };
        } catch (err: any) {
          return { error: err as any };
        }
      },
    }),
    getCustomerOrders: build.query<Array<Order>, { userId: string }>({
      query: ({ userId }) => `customers/${userId}/orders`,
      providesTags: ["Customers"],
    }),
    // Orders
    createOrder: build.mutation<
      { orderId: string; status: string },
      OrderCreate
    >({
      query: (body) => ({
        url: "orders",
        method: "POST",
        body,
      }),
    }),
    getOrdersByChefId: build.query<Order[], { chefId: string }>({
      query: ({ chefId }) => `orders/chef/${chefId}`,
      providesTags: ["OrdersByChef"],
    }),
    updateOrderStatus: build.mutation<
      Order,
      { orderId: string; status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" }
    >({
      query: ({ orderId, status }) => ({
        url: `orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["OrdersByChef"],
    }),

    // Chef directory
    getAllChefs: build.query<
      {
        chefs: Array<{
          id: string;
          username: string;
          name: string;
          location: string;
          bio: string | null;
          specialties: string | null;
          profileImage: string | null;
          _count: { meals: number; order: number };
        }>;
      },
      { search?: string }
    >({
      query: ({ search }) =>
        search ? `chefs?search=${encodeURIComponent(search)}` : "chefs",
      providesTags: ["Chefs"],
    }),

    // Menu distribution
    distributeMenu: build.mutation<
      { message: string; sent: number; failed: number; total: number },
      { menuId: string }
    >({
      query: ({ menuId }) => ({
        url: `menus/${menuId}/distribute`,
        method: "POST",
      }),
      invalidatesTags: ["MenusByChef"],
    }),

    // Subscribers
    subscribeToChef: build.mutation<
      { message: string; id: string },
      { chefId: string; email: string; name?: string }
    >({
      query: ({ chefId, email, name }) => ({
        url: `subscribers/${chefId}`,
        method: "POST",
        body: { email, name },
      }),
    }),
    getSubscribers: build.query<
      { count: number; subscribers: Array<{ id: string; email: string; name: string | null; createdAt: string }> },
      { chefId: string }
    >({
      query: ({ chefId }) => `subscribers/${chefId}`,
      providesTags: ["Subscribers"],
    }),
  }),
});

export const {
  useCreateMealMutation,
  useUpdateMealMutation,
  useGetMealsByChefQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetMenusByChefQuery,
  useGetChefByUsernameQuery,
  useGetUsernameExistsQuery,
  useLazyGetUsernameExistsQuery,
  useUpdateChefMutation,
  useGetChefsWeeklyMenuQuery,
  useLazyGetChefsWeeklyMenuQuery,
  useGetChefByUserIdQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
  useUploadFileMutation,
  useCreateOrderMutation,
  useGetCustomerOrdersQuery,
  useGetOrdersByChefIdQuery,
  useUpdateOrderStatusMutation,
  useGetChefStatsQuery,
  useDistributeMenuMutation,
  useSubscribeToChefMutation,
  useGetSubscribersQuery,
  useGetAllChefsQuery,
} = api;

/**
 * Call sync-user endpoint to create user and profile immediately after signup
 * No token needed - backend validates user exists in Cognito via AdminGetUser
 */
export const callSyncUserEndpoint = async (
  signupData: SignUpType,
  userEmail: string,
) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    if (!apiBaseUrl) {
      throw new Error(
        "API base URL is not configured (NEXT_PUBLIC_API_BASE_URL)",
      );
    }

    // No token needed - backend will validate via AdminGetUser
    const response = await fetch(`${apiBaseUrl}/auth/sync-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...signupData,
        email: userEmail,
      }),
      // No Authorization header needed
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Sync failed with status ${response.status}: ${response.statusText}. Response: ${errorBody}`,
      );
    }

    const userData = await response.json();
    return userData.user || userData;
  } catch (error: any) {
    console.error("Failed to sync user with backend:", error);
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "Network error - Backend server may not be running or CORS is misconfigured",
      );
      throw new Error(
        `Unable to connect to backend server at ${apiBaseUrl}. Make sure the backend is running.`,
      );
    }
    throw error;
  }
};
