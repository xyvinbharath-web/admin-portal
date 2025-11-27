"use client";

import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { SubscriptionPlan, SubscriptionStatus } from "@/services/admin/subscriptions";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const { data, isLoading, isError, query, setQuery } = useAdminSubscriptions();

  const records = data?.records || [];

  const handlePlanChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      plan: (value || undefined) as SubscriptionPlan | undefined,
    }));
  };

  const handleStatusChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: (value || undefined) as SubscriptionStatus | undefined,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Subscriptions</h2>
        <p className="text-sm text-slate-500">
          Manage membership plans and renewals.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Plan</span>
          <select
            className="h-8 w-32 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700"
            value={query.plan || ""}
            onChange={(e) => handlePlanChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="gold">Gold</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600">Status</span>
          <select
            className="h-8 w-32 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700"
            value={query.status || ""}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Subscriptions
        </div>

        {isLoading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : isError ? (
          <div className="p-4 text-sm text-red-500">Failed to load subscriptions.</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No subscriptions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Expires At</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row._id} className="border-t text-slate-700">
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.name || "Unnamed"}</span>
                        <span className="text-xs text-slate-500">{row.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm capitalize">
                      {row.subscription?.plan || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm capitalize">
                      {row.subscription?.status || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {row.subscription?.expiresAt
                        ? new Date(row.subscription.expiresAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-slate-500">
          <div>
            Page {data?.page || 1} of {data?.totalPages || 1} · {data?.totalRecords || 0} total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(data?.page || 1) <= 1}
              onClick={() => handlePageChange((data?.page || 1) - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data || (data.page || 1) >= (data.totalPages || 1)}
              onClick={() => handlePageChange((data?.page || 1) + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
