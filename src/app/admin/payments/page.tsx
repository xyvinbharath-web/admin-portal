"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminPayments } from "@/hooks/useAdminPayments";
import type { PaymentStatus } from "@/services/admin/payments";

export default function PaymentsPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery } = useAdminPayments({ page: 1, limit: 10 });

  const [statusFilter, setStatusFilter] = useState<string>(query.status ?? "");

  function handlePageChange(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as PaymentStatus | undefined,
    }));
  }

  const pagination = data
    ? {
        page: (data as any).page,
        limit: (data as any).limit,
        totalPages: (data as any).totalPages,
        totalRecords: (data as any).totalRecords,
      }
    : undefined;

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Payments</h1>
            <p className="text-xs text-slate-500">View subscription payments.</p>
          </div>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Plan is currently fixed to gold; filter by status below."
                disabled
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                className="h-9 rounded-md border bg-white px-2"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Plan</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Paid at</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading && (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                        Loading payments...
                      </td>
                    </tr>
                  )}

                  {!isLoading && (!data || (data as any).records.length === 0) && (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                        No payments found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    data &&
                    (data as any).records.map((p: any) => (
                      <tr key={p._id} className="text-[13px] text-slate-700">
                        <td className="px-3 py-2 align-top text-xs">
                          <button
                            type="button"
                            className="max-w-xs truncate text-left text-sky-700 hover:underline"
                            onClick={() => router.push(`/admin/users/${p.user}`)}
                          >
                            {p.user}
                          </button>
                        </td>
                        <td className="px-3 py-2 align-top text-xs">
                          {p.amount} {p.currency?.toUpperCase?.() || ""}
                        </td>
                        <td className="px-3 py-2 align-top text-xs">{p.plan}</td>
                        <td className="px-3 py-2 align-top text-xs">{p.status}</td>
                        <td className="px-3 py-2 align-top text-xs text-slate-500">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                <div>
                  Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} payments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                  <select
                    className="h-7 rounded-md border bg-white px-2"
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToastProvider>
  );
}
