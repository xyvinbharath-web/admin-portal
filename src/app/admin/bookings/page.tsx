"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import type { BookingAdminRow, BookingStatus } from "@/services/admin/bookings";

export default function BookingsPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery, updateStatus, updateStatusState } = useAdminBookings({
    page: 1,
    limit: 10,
  });

  const [search, setSearch] = useState(query.q ?? "");
  const [statusFilter, setStatusFilter] = useState<string>(query.status ?? "");

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, q: search || undefined }));
    }, 400);
    return () => clearTimeout(id);
  }, [search, setQuery]);

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
      status: (value || undefined) as BookingStatus | undefined,
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

  async function handleStatusUpdate(booking: BookingAdminRow, status: BookingStatus) {
    await updateStatus({ id: booking._id, status });
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Bookings</h1>
            <p className="text-xs text-slate-500">Review and manage user bookings.</p>
          </div>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Search by event title or user name/email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-0">
            {/* Mobile: cards */}
            <div className="space-y-2 p-3 text-xs md:hidden">
              {isLoading ? (
                <div className="rounded-lg border bg-white p-3 text-slate-500">
                  Loading bookings...
                </div>
              ) : !data || (data as any).records.length === 0 ? (
                <div className="rounded-lg border bg-white p-3 text-slate-500">
                  No bookings found. Try adjusting your search or filters.
                </div>
              ) : (
                (data as any).records.map((b: BookingAdminRow) => (
                  <div
                    key={b._id}
                    className="rounded-xl border bg-white p-3 shadow-sm"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Event
                    </div>
                    <button
                      type="button"
                      className="mt-0.5 line-clamp-2 text-[11px] font-medium text-sky-700 hover:underline"
                      onClick={() => router.push(`/admin/events/${b.eventId}`)}
                    >
                      {b.eventTitle || b.eventId}
                    </button>

                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          User
                        </div>
                        {b.userId ? (
                          <button
                            type="button"
                            className="mt-0.5 line-clamp-2 text-left text-sky-700 hover:underline"
                            onClick={() => router.push(`/admin/users/${b.userId}`)}
                          >
                            {b.userName || b.userEmail || b.userId}
                          </button>
                        ) : (
                          <div className="mt-0.5 text-slate-500">Unknown user</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Status
                        </div>
                        <select
                          className="mt-0.5 h-7 w-full rounded-md border bg-white px-2 text-[11px]"
                          value={b.status}
                          disabled={updateStatusState.isPending}
                          onChange={async (e) => {
                            await handleStatusUpdate(b, e.target.value as BookingStatus);
                          }}
                        >
                          <option value="booked">Booked</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-700">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Booked at
                      </div>
                      <div>
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
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
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Event</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Booked at</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading && (
                      <tr>
                        <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                          Loading bookings...
                        </td>
                      </tr>
                    )}

                    {!isLoading && (!data || (data as any).records.length === 0) && (
                      <tr>
                        <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={5}>
                          No bookings found. Try adjusting your search or filters.
                        </td>
                      </tr>
                    )}

                    {!isLoading &&
                      data &&
                      (data as any).records.map((b: BookingAdminRow) => (
                        <tr key={b._id} className="text-[13px] text-slate-700">
                          <td className="px-3 py-2 align-top text-xs">
                            <button
                              type="button"
                              className="max-w-xs truncate font-medium text-left text-sky-700 hover:underline"
                              onClick={() => router.push(`/admin/events/${b.eventId}`)}
                            >
                              {b.eventTitle || b.eventId}
                            </button>
                          </td>
                          <td className="px-3 py-2 align-top text-xs">
                            {b.userId ? (
                              <button
                                type="button"
                                className="max-w-xs truncate text-left text-sky-700 hover:underline"
                                onClick={() => router.push(`/admin/users/${b.userId}`)}
                              >
                                {b.userName || b.userEmail || b.userId}
                              </button>
                            ) : (
                              <span className="text-slate-500">Unknown user</span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top text-xs">
                            <select
                              className="h-7 rounded-md border bg-white px-2 text-[11px]"
                              value={b.status}
                              disabled={updateStatusState.isPending}
                              onChange={async (e) => {
                                await handleStatusUpdate(b, e.target.value as BookingStatus);
                              }}
                            >
                              <option value="booked">Booked</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 align-top text-xs text-slate-500">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                          </td>
                          <td className="px-3 py-2 align-top text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => router.push(`/admin/events/${b.eventId}`)}
                              >
                                View event
                              </Button>
                              {b.userId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={() => router.push(`/admin/users/${b.userId}`)}
                                >
                                  View user
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                  <div>
                    Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} bookings
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
            </div>
          </CardContent>
        </Card>
      </div>
    </ToastProvider>
  );
}
