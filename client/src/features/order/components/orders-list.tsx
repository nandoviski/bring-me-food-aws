import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ChefOrdersSection } from "./chef-orders-section";
import MainPageWithHeader from "@/components/chef/main-page-with-header";

export default function OrderList() {
  return (
    <MainPageWithHeader
      title="Orders"
      description="Manage your customer orders"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Orders</span>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Clock className="h-4 w-4" />
                <span>Last 7 days</span>
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Manage your customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <ChefOrdersSection />
        </CardContent>
      </Card>
    </MainPageWithHeader>
  );
}
