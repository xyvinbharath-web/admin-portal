"use client";

import { useState } from "react";
import { useAdminPosts } from "@/hooks/useAdminPosts";
import type { PostStatus } from "@/services/admin/posts";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: { value: PostStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPostsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data,
    isLoading,
    query,
    setPage,
    setLimit,
    setStatusFilter,
    setSearch,
    updateStatus,
    updateStatusState,
    bulkUpdateStatus,
    bulkUpdateStatusState,
  } = useAdminPosts({ page: 1, limit: 20 });

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      }
    : undefined;

  function handleStatusFilterChange(value: string) {
    setStatusFilter((value || "") as PostStatus | "");
  }

  async function handleRowStatusChange(id: string, status: PostStatus) {
    await updateStatus({ id, status });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAllOnPage() {
    if (!data || data.records.length === 0) return;
    const pageIds = data.records.map((r) => r._id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }

  async function handleBulkChange(status: PostStatus) {
    if (selectedIds.length === 0) return;
    await bulkUpdateStatus({ ids: selectedIds, status });
    setSelectedIds([]);
  }

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Posts</h2>
        <p className="text-sm text-slate-500">Moderate community posts and approvals.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 text-xs md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Filters
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Status</span>
              <select
                className="h-8 rounded-md border bg-white px-2 text-xs"
                value={query.status || ""}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="text"
              className="h-8 w-40 rounded-md border bg-white px-2 text-xs text-slate-700 md:w-64"
              placeholder="Search content..."
              value={query.q || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
        {pagination && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={pagination.page === 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
              <select
                className="h-7 rounded-md border bg-white px-2"
                value={pagination.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white">
        {/* Mobile: cards */}
        <div className="space-y-2 p-3 text-xs md:hidden">
          {isLoading ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              Loading posts...
            </div>
          ) : !data || data.records.length === 0 ? (
            <div className="rounded-lg border bg-white p-3 text-slate-500">
              No posts found.
            </div>
          ) : (
            data.records.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      User
                    </div>
                    <div className="text-xs font-medium text-slate-900">
                      {row.user?.name || row.user?.email || row.user?._id || "Unknown"}
                    </div>
                    {row.user?.email && (
                      <div className="text-[11px] text-slate-500">{row.user.email}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
                      {row.status}
                    </span>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-300"
                        checked={selectedIds.includes(row._id)}
                        onChange={() => toggleSelect(row._id)}
                      />
                      <span>Select</span>
                    </label>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-700">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Content
                  </div>
                  <div className="line-clamp-4 whitespace-pre-wrap">
                    {row.content}
                  </div>
                </div>
                {row.createdAt && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      Created at
                    </div>
                    <div>{new Date(row.createdAt).toLocaleString()}</div>
                  </div>
                )}
                <div className="mt-2">
                  <select
                    className="h-8 w-full rounded-md border bg-white px-2 text-[11px]"
                    value={row.status}
                    disabled={updateStatusState.isPending}
                    onChange={async (e) =>
                      handleRowStatusChange(row._id, e.target.value as PostStatus)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-slate-300"
                      onChange={toggleSelectAllOnPage}
                      checked={
                        !!data &&
                        data.records.length > 0 &&
                        data.records.every((r) => selectedIds.includes(r._id))
                      }
                    />
                  </th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Content</th>
                  <th className="px-3 py-2">Created at</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-xs text-slate-500"
                      colSpan={5}
                    >
                      Loading posts...
                    </td>
                  </tr>
                )}

                {!isLoading && (!data || data.records.length === 0) && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-xs text-slate-500"
                      colSpan={4}
                    >
                      No posts found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  data &&
                  data.records.map((row) => (
                    <tr key={row._id} className="text-[13px] text-slate-700">
                      <td className="px-3 py-2 align-top text-xs">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-300"
                          checked={selectedIds.includes(row._id)}
                          onChange={() => toggleSelect(row._id)}
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        <div className="font-medium">
                          {row.user?.name || row.user?.email || row.user?._id || "Unknown"}
                        </div>
                        {row.user?.email && (
                          <div className="text-[11px] text-slate-500">{row.user.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        <div className="line-clamp-3 whitespace-pre-wrap">{row.content}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-xs text-slate-500">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2 align-top text-xs">
                        <select
                          className="h-7 rounded-md border bg-white px-2 text-[11px] capitalize"
                          value={row.status}
                          disabled={updateStatusState.isPending}
                          onChange={async (e) =>
                            handleRowStatusChange(row._id, e.target.value as PostStatus)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
              <div>
                Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} posts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Next
                </Button>
                <select
                  className="h-7 rounded-md border bg-white px-2"
                  value={pagination.limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}
        </div>
        {hasSelection && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="font-medium">Bulk actions</span>
            <span className="text-slate-500">({selectedIds.length} selected)</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              disabled={bulkUpdateStatusState.isPending}
              onClick={() => handleBulkChange("approved")}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              disabled={bulkUpdateStatusState.isPending}
              onClick={() => handleBulkChange("rejected")}
            >
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-slate-500"
              disabled={bulkUpdateStatusState.isPending}
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
