import React from "react";
import { ChefSidebar } from "@/features/chef/components/chef-sidebar";

type Props = {
  children: React.ReactNode;
};

export default function ChefLayout({ children }: Props) {
  return (
    <div className="container-custom flex h-[calc(100vh-67px)]">
      <ChefSidebar />
      <main className="mt-3 ml-3 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
