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
  paidRevenueThisWeek: number;
  awaitingPaymentCount: number;
  ordersThisWeek: number;
  ordersChange: number | null;
  activeMeals: number;
  pendingOrders: number;
  uniqueCustomersThisWeek: number;
  customersChange: number | null;
};
export type DeliveryZones = {
  deliveryMode: "ALL" | "ZONES";
  deliveryZones: string[];
  deliveryCities: string[];
};

export type AdminStats = {
  success: boolean;
  stats: {
    users: { total: number; chefs: number; customers: number };
    orders: { total: number; pending: number; thisWeek: number; thisMonth: number };
    revenue: { total: number; thisWeek: number; thisMonth: number };
    subscribers: { total: number };
  };
  recentChefs: Array<{ id: string; name: string; username: string; location: string; createdAt: string }>;
  recentOrders: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    total: number;
    guestName: string | null;
    createdAt: string;
    chef: { name: string; username: string };
  }>;
};

export type AdminChef = {
  id: string;
  name: string;
  username: string;
  location: string;
  profileImage: string | null;
  deliveryMode: string;
  featured: boolean;
  createdAt: string;
  user: { id: string; email: string; status: string; isAdmin: boolean; createdAt: string };
  stats: { orders: number; subscribers: number; meals: number; revenue: number };
};

export type AdminChefsResponse = {
  success: boolean;
  chefs: AdminChef[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type AdminOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  notes: string | null;
  promoCode: string | null;
  discountAmount: number | null;
  createdAt: string;
  chef: { id: string; name: string; username: string };
  customer: { firstName: string; lastName: string; user: { email: string } } | null;
  mealsOnOrders: Array<{ quantity: number; priceAtPurchase: number; meal: { name: string } }>;
};

export type AdminOrdersResponse = {
  success: boolean;
  orders: AdminOrder[];
  pagination: { page: number; limit: number; total: number; pages: number };
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
    "PromoCodes",
    "AdminChefs",
    "AdminOrders",
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
    getPopularMeals: build.query<
      { meals: Array<{ id: string; name: string; price: number; totalOrdered: number; totalRevenue: number }> },
      { chefId: string }
    >({
      query: ({ chefId }) => `chefs/${chefId}/popular-meals`,
    }),
    getChefStats: build.query<ChefStats, { chefId: string }>({
      query: ({ chefId }) => `chefs/${chefId}/stats`,
      providesTags: ["Chefs"],
    }),
    getDeliveryZones: build.query<DeliveryZones, { chefId: string }>({
      query: ({ chefId }) => `chefs/${chefId}/delivery-zones`,
      providesTags: ["Chefs"],
    }),
    updateDeliveryZones: build.mutation<DeliveryZones, { chefId: string; data: DeliveryZones }>({
      query: ({ chefId, data }) => ({
        url: `chefs/${chefId}/delivery-zones`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chefs"],
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
      { orderId: string; status: string; isGuest?: boolean; outsideZone?: boolean; deliverySuburb?: string | null },
      OrderCreate
    >({
      query: (body) => ({
        url: "orders",
        method: "POST",
        body,
      }),
    }),
    createCheckoutSession: build.mutation<
      { url: string; sessionId: string },
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `orders/${orderId}/checkout`,
        method: "POST",
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
          featured: boolean;
          available: boolean;
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
      {
        message: string;
        emailSent: number;
        emailFailed: number;
        smsSent: number;
        smsFailed: number;
        smsSubscribers: number;
        smsConfigured: boolean;
        total: number;
        totalSent: number;
      },
      { menuId: string }
    >({
      query: ({ menuId }) => ({
        url: `menus/${menuId}/distribute`,
        method: "POST",
      }),
      invalidatesTags: ["MenusByChef"],
    }),

    // Revenue trend chart
    getRevenueTrend: build.query<
      {
        days: number;
        trend: Array<{
          date: string;
          revenue: number;
          paidRevenue: number;
          orders: number;
        }>;
      },
      { chefId: string; days?: number }
    >({
      query: ({ chefId, days = 30 }) => `chefs/${chefId}/revenue-trend?days=${days}`,
      providesTags: ["OrdersByChef"],
    }),

    // Promo codes (chef management)
    listPromoCodes: build.query<
      {
        codes: Array<{
          id: string;
          code: string;
          discountType: "PERCENTAGE" | "FIXED";
          discountValue: number;
          maxUses: number | null;
          usedCount: number;
          expiresAt: string | null;
          active: boolean;
          createdAt: string;
        }>;
      },
      void
    >({
      query: () => "promo-codes",
      providesTags: ["PromoCodes"],
    }),
    createPromoCode: build.mutation<
      { id: string; code: string },
      {
        code: string;
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        maxUses?: number;
        expiresAt?: string;
      }
    >({
      query: (body) => ({ url: "promo-codes", method: "POST", body }),
      invalidatesTags: ["PromoCodes"],
    }),
    deactivatePromoCode: build.mutation<{ id: string; active: boolean }, { codeId: string }>({
      query: ({ codeId }) => ({ url: `promo-codes/${codeId}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["PromoCodes"],
    }),
    validatePromoCode: build.mutation<
      {
        valid: boolean;
        code?: string;
        discountType?: "PERCENTAGE" | "FIXED";
        discountValue?: number;
        discountAmount?: number;
        finalTotal?: number;
        message?: string;
      },
      { code: string; chefId: string; orderTotal: number }
    >({
      query: (body) => ({ url: "promo-codes/validate", method: "POST", body }),
    }),

    // Subscribers
    subscribeToChef: build.mutation<
      { message: string; id: string },
      { chefId: string; email: string; name?: string; phone?: string }
    >({
      query: ({ chefId, email, name, phone }) => ({
        url: `subscribers/${chefId}`,
        method: "POST",
        body: { email, name, phone },
      }),
    }),
    getSubscribers: build.query<
      {
        count: number;
        subscribers: Array<{
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          smsOptedOut: boolean;
          createdAt: string;
        }>;
      },
      { chefId: string }
    >({
      query: ({ chefId }) => `subscribers/${chefId}`,
      providesTags: ["Subscribers"],
    }),

    // ── Admin endpoints ────────────────────────────────────────────────────
    getAdminStats: build.query<AdminStats, void>({
      query: () => "admin/stats",
    }),
    getAdminChefs: build.query<AdminChefsResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search = "" } = {}) =>
        `admin/chefs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ["AdminChefs"],
    }),
    getAdminOrders: build.query<AdminOrdersResponse, { page?: number; limit?: number; status?: string; paymentStatus?: string }>({
      query: ({ page = 1, limit = 20, status = "", paymentStatus = "" } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set("status", status);
        if (paymentStatus) params.set("paymentStatus", paymentStatus);
        return `admin/orders?${params.toString()}`;
      },
      providesTags: ["AdminOrders"],
    }),
    updateUserStatus: build.mutation<{ success: boolean; user: { id: string; email: string; status: string } }, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `admin/users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminChefs"],
    }),
    toggleAdminFlag: build.mutation<{ success: boolean; user: { id: string; email: string; isAdmin: boolean } }, { userId: string; isAdmin: boolean }>({
      query: ({ userId, isAdmin }) => ({
        url: `admin/users/${userId}/make-admin`,
        method: "PATCH",
        body: { isAdmin },
      }),
      invalidatesTags: ["AdminChefs"],
    }),
    getAdminRevenueTrend: build.query<{ success: boolean; trend: Array<{ date: string; revenue: number }>; days: number }, { days?: number }>({
      query: ({ days = 30 } = {}) => `admin/revenue-trend?days=${days}`,
    }),
    updateChefAvailability: build.mutation<{ id: string; available: boolean }, { chefId: string; available: boolean }>({
      query: ({ chefId, available }) => ({
        url: `chefs/${chefId}/availability`,
        method: "PATCH",
        body: { available },
      }),
      invalidatesTags: ["ChefByUserId"],
    }),
    toggleFeaturedChef: build.mutation<{ success: boolean; chef: { id: string; name: string; featured: boolean } }, { chefId: string; featured: boolean }>({
      query: ({ chefId, featured }) => ({
        url: `admin/chefs/${chefId}/featured`,
        method: "PATCH",
        body: { featured },
      }),
      invalidatesTags: ["AdminChefs", "Chefs"],
    }),
  }),
});

export const {
  useGetRevenueTrendQuery,
  useListPromoCodesQuery,
  useCreatePromoCodeMutation,
  useDeactivatePromoCodeMutation,
  useValidatePromoCodeMutation,
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
  useCreateCheckoutSessionMutation,
  useGetCustomerOrdersQuery,
  useGetOrdersByChefIdQuery,
  useUpdateOrderStatusMutation,
  useGetChefStatsQuery,
  useGetPopularMealsQuery,
  useGetDeliveryZonesQuery,
  useUpdateDeliveryZonesMutation,
  useDistributeMenuMutation,
  useSubscribeToChefMutation,
  useGetSubscribersQuery,
  useGetAllChefsQuery,
  useGetAdminStatsQuery,
  useGetAdminChefsQuery,
  useGetAdminOrdersQuery,
  useUpdateUserStatusMutation,
  useToggleAdminFlagMutation,
  useGetAdminRevenueTrendQuery,
  useToggleFeaturedChefMutation,
  useUpdateChefAvailabilityMutation,
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
