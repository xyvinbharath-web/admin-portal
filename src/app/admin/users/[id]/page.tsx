"use client";

import { useParams, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { useAdminUser } from "@/hooks/useAdminUser";
import { useAdminPosts } from "@/hooks/useAdminPosts";
import { UserDetailCard } from "@/components/admin/UserDetailCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AdminPostRow } from "@/services/admin/posts";

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
    updateProfile,
    deleteUser,
    rolePending,
    statusPending,
    membershipPending,
    profilePending,
    deletePending,
  } = useAdminUser(typeof id === "string" ? id : undefined);

  const {
    data: postsData,
    isLoading: postsLoading,
  } = useAdminPosts({ page: 1, limit: 50 });

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
            onUpdateProfile={updateProfile}
            rolePending={rolePending}
            statusPending={statusPending}
            onUpdateMembership={updateMembership}
            membershipPending={membershipPending}
            profilePending={profilePending}
          />
        )}

        {user && (
          <Card className="rounded-2xl border bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold">Posts</CardTitle>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Content created by this user.
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {postsData?.records.filter((p: AdminPostRow) => p.user?._id === user._id).length ?? 0}
                </span>{" "}
                posts
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {postsLoading && (
                <div className="text-xs text-slate-500">Loading posts...</div>
              )}

              {!postsLoading && (!postsData || postsData.records.filter((p) => p.user?._id === user._id).length === 0) && (
                <div className="text-xs text-slate-500">This user has no posts yet.</div>
              )}

              {!postsLoading && postsData && (
                <div className="space-y-3">
                  {postsData.records
                    .filter((p) => p.user?._id === user._id)
                    .map((post) => (
                      <div
                        key={post._id}
                        className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700"
                      >
                        {post.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.image}
                            alt="Post image"
                            className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] leading-snug text-slate-800 line-clamp-3">
                              {post.content}
                            </p>
                            <Badge
                              variant={
                                post.status === "approved"
                                  ? "default"
                                  : post.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-[10px] capitalize"
                            >
                              {post.status}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ToastProvider>
  );
}
