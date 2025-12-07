import React from "react";
import { ChefSidebar } from "@/features/chef/components/chef-sidebar";

type Props = {
  children: React.ReactNode;
};

export default function ChefLayout({ children }: Props) {
  return (
    <div className="container-custom flex flex-1">
      <ChefSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
