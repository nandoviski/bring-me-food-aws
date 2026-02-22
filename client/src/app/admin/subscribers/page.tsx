"use client";

import { useState } from "react";
import { useGetAdminSubscribersQuery } from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { format } from "date-fns";

export default function AdminSubscribersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetAdminSubscribersQuery({ page, limit: 50 });

  const handleExport = () => {
    // Open the export URL (handled server-side as CSV download)
    window.open("/api/admin/subscribers?export=csv", "_blank");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.pagination.total} total subscribers across all chefs` : "Platform-wide subscriber list"}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-gray-400">
              Loading subscribers…
            </div>
          ) : error || !data ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              Failed to load subscribers.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Chef</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-400">
                      No subscribers yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.subscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-sm">{sub.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <a
                          href={`/chef/${sub.chef.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline"
                        >
                          {sub.chef.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {sub.unsubscribed ? (
                          <Badge variant="secondary">Unsubscribed</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {format(new Date(sub.createdAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {data.pagination.page} of {data.pagination.pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
