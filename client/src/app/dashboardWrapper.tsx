"use client";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ShoppingCartProvider } from "@/features/shopping-cart/context/shoppingCartContext";
import StoreProvider, { useAppSelector } from "./redux";
import { useEffect } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  //   const isSidebarCollapsed = useAppSelector(
  //     (state) => state.global.isSidebarCollapsed,
  //   ); // Sidebar implementation at 1:10
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Workaround to apply dark mode class to html element
  // Once we had to separate the layout and the provider, to use "use client" (cant add it to the layout file)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <ShoppingCartProvider>
      <Toaster richColors position="top-right" />
      <Navbar />
      <main>{children}</main>
    </ShoppingCartProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
