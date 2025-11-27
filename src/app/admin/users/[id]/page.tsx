"use client";

import { useParams, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { useAdminUser } from "@/hooks/useAdminUser";
import { UserDetailCard } from "@/components/admin/UserDetailCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const {
    data: user,
    isLoading,
    isError,
    updateRole,
    updateStatus,
    updateMembership,
    deleteUser,
    rolePending,
    statusPending,
    membershipPending,
    deletePending,
  } = useAdminUser(typeof id === "string" ? id : undefined);

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">User details</h1>
            <p className="text-xs text-slate-500">View and manage this user&apos;s account.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")}>
              Back to users
            </Button>
            {user && (
              <ConfirmDialog
                title="Delete user"
                description="This will permanently remove this user and their access. This action cannot be undone."
                destructive
                confirmLabel={deletePending ? "Deleting..." : "Delete"}
                onConfirm={async () => {
                  await deleteUser();
                  router.push("/admin/users");
                }}
                trigger={
                  <Button variant="destructive" size="sm" disabled={deletePending}>
                    Delete
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {isLoading && (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-6 text-sm text-slate-500">Loading user...</CardContent>
          </Card>
        )}

        {isError && !isLoading && (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-6 text-sm text-rose-500">
              Failed to load user. Try again later.
            </CardContent>
          </Card>
        )}

        {user && (
          <UserDetailCard
            user={user}
            onUpdateRole={updateRole}
            onUpdateStatus={updateStatus}
            rolePending={rolePending}
            statusPending={statusPending}
            onUpdateMembership={updateMembership}
            membershipPending={membershipPending}
          />
        )}
      </div>
    </ToastProvider>
  );
}
