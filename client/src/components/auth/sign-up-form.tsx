"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import type { ChefSignUpType, CustomerSignUpType } from "@/schema";
import { ChefSignUpSchema, CustomerSignUpSchema } from "@/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  onSignUpSuccess?: (email: string, username: string) => void;
  onSwitchToLogin?: () => void;
};

export function SignUpForm({ onSignUpSuccess, onSwitchToLogin }: Props) {
  const { signUp, isLoading, clearError } = useAuth();
  const [userType, setUserType] = useState<"chef" | "customer">("customer");

  // Chef form
  const chefForm = useForm<ChefSignUpType>({
    resolver: zodResolver(ChefSignUpSchema),
    mode: "onBlur",
    defaultValues: {
      userType: "chef",
    },
  });

  // Customer form
  const customerForm = useForm<CustomerSignUpType>({
    resolver: zodResolver(CustomerSignUpSchema),
    mode: "onBlur",
    defaultValues: {
      userType: "customer",
    },
  });

  const onSubmitChef = async (data: ChefSignUpType) => {
    clearError();
    try {
      await signUp(
        data.email,
        data.username,
        data.password,
        data.fullName,
        "chef",
      );
      onSignUpSuccess?.(data.email, data.username);
    } catch (err: any) {
      console.error("Sign up error:", err);
      chefForm.setError("root", {
        message: err.message || "Failed to sign up. Please try again.",
      });
    }
  };

  const onSubmitCustomer = async (data: CustomerSignUpType) => {
    clearError();
    try {
      const fullName = `${data.firstName} ${data.lastName}`;
      await signUp(
        data.email,
        data.username,
        data.password,
        fullName,
        "customer",
      );
      onSignUpSuccess?.(data.email, data.username);
    } catch (err: any) {
      console.error("Sign up error:", err);
      customerForm.setError("root", {
        message: err.message || "Failed to sign up. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={userType}
        onValueChange={(value) => setUserType(value as "chef" | "customer")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="chef">Chef</TabsTrigger>
        </TabsList>

        {/* Customer Sign-Up Form */}
        <TabsContent value="customer" className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              customerForm.handleSubmit(onSubmitCustomer)();
            }}
            className="space-y-4"
          >
            {/* Common Fields */}
            <div>
              <Label htmlFor="customer-email">Email Address</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="you@example.com"
                {...customerForm.register("email")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-username">Username</Label>
              <Input
                id="customer-username"
                type="text"
                placeholder="3-20 characters (letters, numbers, _ -)"
                {...customerForm.register("username")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.username.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                3-20 characters, letters, numbers, underscores, hyphens only
              </p>
            </div>

            <div>
              <Label htmlFor="customer-password">Password</Label>
              <Input
                id="customer-password"
                type="password"
                placeholder="At least 8 characters with uppercase, number, and special character"
                {...customerForm.register("password")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must contain: 8+ characters, uppercase letter, number, special
                character
              </p>
            </div>

            <div>
              <Label htmlFor="customer-confirmPassword">Confirm Password</Label>
              <Input
                id="customer-confirmPassword"
                type="password"
                placeholder="Confirm password"
                {...customerForm.register("confirmPassword")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Customer-Specific Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-firstName">First Name</Label>
                <Input
                  id="customer-firstName"
                  type="text"
                  placeholder="John"
                  {...customerForm.register("firstName")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customer-lastName">Last Name</Label>
                <Input
                  id="customer-lastName"
                  type="text"
                  placeholder="Doe"
                  {...customerForm.register("lastName")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="customer-phoneNumber">Phone Number</Label>
              <Input
                id="customer-phoneNumber"
                type="tel"
                placeholder="0412345678"
                {...customerForm.register("phoneNumber")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                type="text"
                placeholder="123 Main St"
                {...customerForm.register("address")}
                disabled={isLoading}
              />
              {customerForm.formState.errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {customerForm.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-city">City</Label>
                <Input
                  id="customer-city"
                  type="text"
                  placeholder="Sydney"
                  {...customerForm.register("city")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customer-state">State</Label>
                <Input
                  id="customer-state"
                  type="text"
                  placeholder="NSW"
                  {...customerForm.register("state")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-country">Country</Label>
                <Input
                  id="customer-country"
                  type="text"
                  placeholder="AU"
                  {...customerForm.register("country")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="customer-postalCode">Postal Code</Label>
                <Input
                  id="customer-postalCode"
                  type="text"
                  placeholder="1234"
                  {...customerForm.register("postalCode")}
                  disabled={isLoading}
                />
                {customerForm.formState.errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {customerForm.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {customerForm.formState.errors.root && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {customerForm.formState.errors.root.message}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>

        {/* Chef Sign-Up Form */}
        <TabsContent value="chef" className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              chefForm.handleSubmit(onSubmitChef)();
            }}
            className="space-y-4"
          >
            {/* Common Fields */}
            <div>
              <Label htmlFor="chef-fullName">Full Name</Label>
              <Input
                id="chef-fullName"
                type="text"
                placeholder="John Doe"
                {...chefForm.register("fullName")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="chef-email">Email Address</Label>
              <Input
                id="chef-email"
                type="email"
                placeholder="you@example.com"
                {...chefForm.register("email")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="chef-username">Username</Label>
              <Input
                id="chef-username"
                type="text"
                placeholder="3-20 characters (letters, numbers, _ -)"
                {...chefForm.register("username")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.username.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                3-20 characters, letters, numbers, underscores, hyphens only
              </p>
            </div>

            <div>
              <Label htmlFor="chef-password">Password</Label>
              <Input
                id="chef-password"
                type="password"
                placeholder="At least 8 characters with uppercase, number, and special character"
                {...chefForm.register("password")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must contain: 8+ characters, uppercase letter, number, special
                character
              </p>
            </div>

            <div>
              <Label htmlFor="chef-confirmPassword">Confirm Password</Label>
              <Input
                id="chef-confirmPassword"
                type="password"
                placeholder="Confirm password"
                {...chefForm.register("confirmPassword")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Chef-Specific Fields */}
            <div>
              <Label htmlFor="chef-location">Location</Label>
              <Input
                id="chef-location"
                type="text"
                placeholder="Sydney, NSW"
                {...chefForm.register("location")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="chef-specialties">Specialties (Optional)</Label>
              <Input
                id="chef-specialties"
                type="text"
                placeholder="e.g., Italian, Vegan, Gluten-free"
                {...chefForm.register("specialties")}
                disabled={isLoading}
              />
              {chefForm.formState.errors.specialties && (
                <p className="mt-1 text-sm text-red-600">
                  {chefForm.formState.errors.specialties.message}
                </p>
              )}
            </div>

            {chefForm.formState.errors.root && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {chefForm.formState.errors.root.message}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
