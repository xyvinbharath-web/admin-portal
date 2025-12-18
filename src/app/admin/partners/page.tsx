"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { DataTable } from "@/components/admin/DataTable";
import { RoleEnum, StatusEnum, MembershipTierEnum } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToastProvider, emitToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { useCreateAdminUser } from "@/hooks/useCreateAdminUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PartnersPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery } = useAdminUsers({ page: 1, limit: 10 });
  const [search, setSearch] = useState(query.q ?? "");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createRole, setCreateRole] = useState<RoleEnum>("partner");
  const [createStatus, setCreateStatus] = useState<StatusEnum | "">("active");
  const [createTier, setCreateTier] = useState<MembershipTierEnum>("free");

  const createUserMutation = useCreateAdminUser();

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

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      await createUserMutation.mutateAsync({
        name: createName.trim(),
        email: createEmail.trim() || undefined,
        phone: createPhone.trim() || undefined,
        role: createRole,
        status: (createStatus || undefined) as StatusEnum | undefined,
        membershipTier: createTier,
      });
      setCreateOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreateRole("partner");
      setCreateStatus("active");
      setCreateTier("free");
      emitToast("Partner created", "success");
    } catch (err) {
      emitToast("Failed to create partner", "error");
    }
  }

  const filteredRecords = (data?.records ?? []).filter((user: any) => {
    if (query.role) {
      return user.role === query.role;
    }
    // Default: only show partner-related roles in this view
    return ["partner", "partner_request"].includes(user.role);
  });

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Partners</h1>
            <p className="text-xs text-slate-500">
              Manage partners and partnership requests.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create partner
          </Button>
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
                value={(query.role as string) ?? ""}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="">All partner types</option>
                <option value="partner">Partner</option>
                <option value="partner_request">Partner request</option>
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
              Loading partners...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-lg border bg-white p-3 text-xs text-slate-500">
              No partners found. Try adjusting your search or filters.
            </div>
          ) : (
            filteredRecords.map((u: any) => {
              const initials = (u.name?.[0] || u.email?.[0] || "P").toUpperCase();
              return (
              <div
                key={u._id}
                className="rounded-xl border bg-white p-3 text-xs shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {u.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <AvatarFallback className="text-[11px] font-semibold">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => router.push(`/admin/partners/${u._id}`)}
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
                      Type
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
            );
          })
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
                key: "name",
                header: "Partner",
                render: (u: any) => {
                  const initials = (u.name?.[0] || u.email?.[0] || "P").toUpperCase();
                  return (
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/partners/${u._id}`)}
                      className="flex w-full items-center gap-3 text-left hover:opacity-90"
                    >
                      <Avatar className="h-8 w-8">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-[11px] font-semibold">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{u.name}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </button>
                  );
                },
              },
              { key: "phone", header: "Phone" },
              { key: "role", header: "Type" },
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
                    onClick={() => router.push(`/admin/partners/${u._id}`)}
                  >
                    View
                  </Button>
                ),
              },
            ]}
            data={filteredRecords.map((user) => user as any)}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            emptyTitle="No partners found"
            emptyDescription="Try adjusting your search or filters."
          />
        </div>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
              <h2 className="text-sm font-semibold text-slate-900">Create partner</h2>
              <p className="mb-4 mt-1 text-xs text-slate-500">
                Create a new partner or partner request account from the admin panel.
              </p>
              <form className="space-y-3" onSubmit={handleCreateSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Name</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Phone</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Type</label>
                    <select
                      className="w-full rounded-md border px-2 py-2 text-xs"
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as RoleEnum)}
                    >
                      <option value="partner">Partner</option>
                      <option value="partner_request">Partner request</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Status</label>
                    <select
                      className="w-full rounded-md border px-2 py-2 text-xs"
                      value={createStatus}
                      onChange={(e) => setCreateStatus(e.target.value as StatusEnum | "")}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Membership</label>
                    <select
                      className="w-full rounded-md border px-2 py-2 text-xs"
                      value={createTier}
                      onChange={(e) => setCreateTier(e.target.value as MembershipTierEnum)}
                    >
                      <option value="free">Free</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(false)}
                    disabled={createUserMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
