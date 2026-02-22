"use client";

import { useState } from "react";
import {
  useGetAdminChefsQuery,
  useUpdateUserStatusMutation,
  useToggleAdminFlagMutation,
  type AdminChef,
} from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  BLOCKED: { label: "Blocked", variant: "destructive" },
  PENDING: { label: "Pending", variant: "outline" },
  CREATED: { label: "Created", variant: "outline" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, variant: "outline" as const };
  return (
    <Badge
      variant={cfg.variant}
      className={status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : undefined}
    >
      {cfg.label}
    </Badge>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
}

function ChefRow({ chef }: { chef: AdminChef }) {
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateUserStatusMutation();
  const [toggleAdmin, { isLoading: togglingAdmin }] = useToggleAdminFlagMutation();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ userId: chef.user.id, status }).unwrap();
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAdminToggle = async () => {
    try {
      const newValue = !chef.user.isAdmin;
      await toggleAdmin({ userId: chef.user.id, isAdmin: newValue }).unwrap();
      toast.success(newValue ? "Granted admin access" : "Revoked admin access");
    } catch {
      toast.error("Failed to update admin flag");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900">{chef.name}</p>
          <p className="text-xs text-gray-400">@{chef.username}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">{chef.user.email}</TableCell>
      <TableCell className="text-sm text-gray-600">{chef.location}</TableCell>
      <TableCell>
        <StatusBadge status={chef.user.status} />
        {chef.user.isAdmin && (
          <Badge className="ml-1 bg-purple-100 text-purple-700 hover:bg-purple-100">Admin</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        <div className="flex flex-col">
          <span>{chef.stats.orders} orders</span>
          <span className="text-xs text-gray-400">{formatCurrency(chef.stats.revenue)} paid</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {chef.stats.meals} meals · {chef.stats.subscribers} subs
      </TableCell>
      <TableCell className="text-xs text-gray-400">
        {formatDistanceToNow(new Date(chef.createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <a
            href={`/chef/${chef.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={updatingStatus || togglingAdmin}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                Set Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("INACTIVE")}>
                Set Inactive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("BLOCKED")}
                className="text-red-600"
              >
                Block user
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminToggle}>
                {chef.user.isAdmin ? "Revoke admin" : "Make admin"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminChefsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, error } = useGetAdminChefsQuery({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Simple debounce via timeout
    const t = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chefs</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.pagination.total} total` : "Managing all chef accounts"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, username, location…"
            className="pl-9"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-gray-400">
              Loading chefs…
            </div>
          ) : error || !data ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              Failed to load chefs.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chef</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Meals / Subs</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.chefs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-gray-400">
                      No chefs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.chefs.map((chef) => <ChefRow key={chef.id} chef={chef} />)
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
