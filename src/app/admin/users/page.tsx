"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { DataTable } from "@/components/admin/DataTable";
import { UserRow } from "@/components/admin/UserRow";
import { RoleEnum, StatusEnum } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToastProvider } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery } = useAdminUsers({ page: 1, limit: 10, role: "user" });
  const [search, setSearch] = useState(query.q ?? "");

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

  function handleRoleChange(role: string) {
    setQuery((prev) => ({ ...prev, page: 1, role: (role || undefined) as RoleEnum | undefined }));
  }

  function handleStatusChange(status: string) {
    setQuery((prev) => ({ ...prev, page: 1, status: (status || undefined) as StatusEnum | undefined }));
  }

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      }
    : undefined;

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Users</h1>
            <p className="text-xs text-slate-500">Manage all platform users, roles and statuses.</p>
          </div>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                className="h-9 rounded-md border bg-white px-2"
                value={(query.role as string) ?? "user"}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="user">Users only</option>
              </select>
              <select
                className="h-9 rounded-md border bg-white px-2"
                value={(query.status as string) ?? ""}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Mobile: card list */}
        <div className="space-y-2 md:hidden">
          {isLoading ? (
            <div className="rounded-lg border bg-white p-3 text-xs text-slate-500">
              Loading users...
            </div>
          ) : !data || !data.records || data.records.length === 0 ? (
            <div className="rounded-lg border bg-white p-3 text-xs text-slate-500">
              No users found. Try adjusting your search or filters.
            </div>
          ) : (
            data.records.map((u) => (
              <div
                key={u._id}
                className="rounded-xl border bg-white p-3 text-xs shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => router.push(`/admin/users/${u._id}`)}
                  >
                    View
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Phone
                    </div>
                    <div className="text-[11px] text-slate-700">{u.phone || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Role
                    </div>
                    <div className="text-[11px] text-slate-700">{u.role}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Status
                    </div>
                    <div className="text-[11px] text-slate-700 capitalize">{u.status}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Joined
                    </div>
                    <div className="text-[11px] text-slate-700">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span>Courses: {u.coursesCreatedCount ?? 0}</span>
                  <span>Bookings: {u.eventBookingsCount ?? 0}</span>
                  <span>Rewards: {u.rewards ?? 0}</span>
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
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page >= pagination.totalPages}
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
          <DataTable
            columns={[
              {
                key: "user",
                header: "User",
                render: (u: any) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{u.name}</span>
                    <span className="text-xs text-slate-500">{u.email}</span>
                  </div>
                ),
              },
              { key: "phone", header: "Phone" },
              { key: "role", header: "Role" },
              { key: "status", header: "Status" },
              { key: "coursesCreatedCount", header: "Courses" },
              { key: "eventBookingsCount", header: "Bookings" },
              { key: "rewards", header: "Rewards" },
              { key: "createdAt", header: "Joined" },
              {
                key: "actions",
                header: "Actions",
                className: "w-[80px] text-right",
                render: (u: any) => (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => router.push(`/admin/users/${u._id}`)}
                  >
                    View
                  </Button>
                ),
              },
            ]}
            data={data?.records.map((user) => user as any)}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            emptyTitle="No users found"
            emptyDescription="Try adjusting your search or filters."
          />
        </div>
      </div>
    </ToastProvider>
  );
}
