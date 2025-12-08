"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePartnerEarningsAnalytics } from "@/hooks/usePartnerEarningsAnalytics";

export default function PartnerEarningsAnalyticsPage() {
  const { data, isLoading, query, setQuery } = usePartnerEarningsAnalytics({
    page: 1,
    limit: 10,
  });

  const [search, setSearch] = useState(query.q ?? "");

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      }
    : undefined;

  function handlePageChange(page: number) {
    setQuery((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, page: 1, q: search || undefined }));
  }

  const records = data?.records ?? [];

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Partner earnings</h1>
            <p className="text-xs text-slate-500">
              Overview of total earnings and views per partner.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center gap-2"
            >
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" size="sm" className="text-xs">
                Search
              </Button>
            </form>
            {pagination && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <select
                  className="h-9 rounded-md border bg-white px-2"
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-xs text-slate-500">Loading analytics...</div>
            ) : records.length === 0 ? (
              <div className="text-xs text-slate-500">
                No data available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Partner</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2 text-right">Courses</th>
                      <th className="px-3 py-2 text-right">Total views</th>
                      <th className="px-3 py-2 text-right">Paid views</th>
                      <th className="px-3 py-2 text-right">Total earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map((row) => (
                      <tr key={row.partnerId} className="text-[13px] text-slate-700">
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium">{row.partnerName || "-"}</div>
                        </td>
                        <td className="px-3 py-2 align-top text-xs">{row.partnerEmail || "-"}</td>
                        <td className="px-3 py-2 align-top text-xs">{row.partnerPhone || "-"}</td>
                        <td className="px-3 py-2 align-top text-right text-xs">
                          {row.totalCourses ?? 0}
                        </td>
                        <td className="px-3 py-2 align-top text-right text-xs">
                          {row.totalViews ?? 0}
                        </td>
                        <td className="px-3 py-2 align-top text-right text-xs">
                          {row.totalPaidViews ?? 0}
                        </td>
                        <td className="px-3 py-2 align-top text-right text-xs">
                          ₹{row.totalEarnings?.toFixed?.(2) ?? row.totalEarnings ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={pagination.page >= (pagination.totalPages || 1)}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToastProvider>
  );
}
