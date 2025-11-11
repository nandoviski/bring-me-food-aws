# API Call Scaffold

You are helping a developer quickly scaffold RTK Query API calls in their Next.js frontend pages/components.

## Context

The project uses RTK Query (Redux Toolkit Query) for data fetching. All endpoints are defined in `client/src/state/api.ts`. The developer is editing a page or component and needs to call an existing API endpoint to retrieve or mutate data.

## Available Endpoints Reference

### Queries (Data Fetching)

- `useGetMealsByChefQuery({ chefId })` - Get meals by chef
- `useGetMenusByChefQuery({ chefId, filter? })` - Get menus by chef
- `useGetChefByUsernameQuery({ username })` - Get chef profile by username
- `useGetUsernameExistsQuery({ username })` - Check if username exists
- `useGetChefsWeeklyMenuQuery({ chefId })` - Get chef's weekly menu
- `useGetChefByUserIdQuery({ userId })` - Get chef by user ID
- `useGetCustomerQuery({ userId })` - Get customer profile
- `useGetCustomerOrdersQuery({ userId })` - Get customer's orders
- `useGetUsernameExistsQuery({ username })` - Username availability check

### Mutations (Create/Update/Delete)

- `useCreateMealMutation()` - Create a new meal
- `useUpdateMealMutation()` - Update a meal
- `useCreateMenuMutation()` - Create a new menu
- `useUpdateMenuMutation()` - Update a menu
- `useDeleteMenuMutation()` - Delete a menu
- `useUpdateChefMutation()` - Update chef profile
- `useUpdateCustomerMutation()` - Update customer profile
- `useCreateOrderMutation()` - Create an order
- `useUploadFileMutation()` - Upload file to S3

## Common Patterns

### Query Hook Pattern (Read Data)

```tsx
"use client";

import Error from "@/components/error";
import Loading from "@/components/loading";
import { useGetMealsByChefQuery } from "@/state/api";

export default function MyPage() {
  const {
    data: meals,
    error,
    isError,
    isLoading,
    isFetching,
  } = useGetMealsByChefQuery(
    { chefId: "chef-123" },
    { skip: !chefId }, // Optional: skip query if condition not met
  );

  if (isLoading || isFetching) return <Loading message="Loading..." />;
  if (isError) return <Error message="Error retrieving meals" fetchingError={error} />;

  return (
    <div>
      {meals?.map((meal) => (
        <div key={meal.id}>{meal.name}</div>
      ))}
    </div>
  );
}
```

### Mutation Hook Pattern (Create/Update/Delete)

```tsx
"use client";

import { useCreateMealMutation } from "@/state/api";

export default function CreateMealPage() {
  const [createMeal, { isLoading }] = useCreateMealMutation();

  async function handleSubmit(formData) {
    try {
      const result = await createMeal({
        name: formData.name,
        price: formData.price,
        chefId: "chef-123",
      }).unwrap();

      console.log("Meal created:", result);
      // Handle success (redirect, show toast, etc)
    } catch (err: any) {
      console.error("Error:", err);
      alert(err?.data?.message || "Failed to create meal");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Meal"}
      </button>
    </form>
  );
}
```

## Important Notes

1. **Always use "use client"** at the top of pages that use hooks
2. **Use `.unwrap()`** on mutations for straightforward error handling
3. **Use `skip` option** on queries when you need conditional fetching (e.g., wait for user auth)
4. **Import types** from feature schemas for TypeScript safety:
   - `import type { Meal } from "@/features/meal/schema/meal"`
   - `import type { Chef } from "@/features/chef/schema/chef"`
   - etc.

## When to use this command

- Adding a query hook to fetch data when a page loads
- Adding a mutation hook to handle form submissions
- Scaffolding API calls with proper error handling and loading states
- Getting the exact hook names and parameter shapes

## Next Steps After Using This Command

1. Copy the generated code snippet into your page/component
2. Adjust parameters (like IDs, filters) based on your component's state
3. Import any required types from feature schemas
4. Test the component to ensure data loads correctly
