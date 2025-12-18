"use client";

import { useParams, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { useAdminUser } from "@/hooks/useAdminUser";
import { usePartnerCourses } from "@/hooks/usePartnerCourses";
import { UserDetailCard } from "@/components/admin/UserDetailCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AdminPartnerDetailPage() {
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
    courses,
    isLoading: coursesLoading,
    isError: coursesError,
    togglePublished,
    deleteCourse,
    actionPending: coursesActionPending,
  } = usePartnerCourses(typeof id === "string" ? id : undefined);

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Partner details</h1>
            <p className="text-xs text-slate-500">View and manage this partner account.</p>
          </div>
          <div className="flex items-center gap-2">
            {user && user.role === "partner_request" && (
              <Button
                variant="outline"
                size="sm"
                disabled={rolePending}
                onClick={async () => {
                  await updateRole("partner");
                }}
              >
                {rolePending ? "Approving..." : "Approve partner"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/partners")}>
              Back to partners
            </Button>
            {user && (
              <ConfirmDialog
                title="Delete partner"
                description="This will permanently remove this partner and their access. This action cannot be undone."
                destructive
                confirmLabel={deletePending ? "Deleting..." : "Delete"}
                onConfirm={async () => {
                  await deleteUser();
                  router.push("/admin/partners");
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
            <CardContent className="p-6 text-sm text-slate-500">Loading partner...</CardContent>
          </Card>
        )}

        {isError && !isLoading && (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-6 text-sm text-rose-500">
              Failed to load partner. Try again later.
            </CardContent>
          </Card>
        )}

        {user && (
          <UserDetailCard
            user={user}
            onUpdateRole={updateRole}
            onUpdateStatus={updateStatus}
            onUpdateMembership={updateMembership}
            rolePending={rolePending}
            statusPending={statusPending}
            membershipPending={membershipPending}
            onUpdateProfile={updateProfile}
            profilePending={profilePending}
          />
        )}

        {user && (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Courses</h2>
                  <p className="text-xs text-slate-500">View and manage courses created by this partner.</p>
                </div>
              </div>

              {coursesLoading && (
                <div className="text-xs text-slate-500">Loading courses...</div>
              )}

              {coursesError && !coursesLoading && (
                <div className="text-xs text-rose-500">Failed to load courses. Try again later.</div>
              )}

              {!coursesLoading && !coursesError && (!courses || courses.length === 0) && (
                <div className="text-xs text-slate-500">No courses found for this partner.</div>
              )}

              {!coursesLoading && !coursesError && courses && courses.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2">Published</th>
                        <th className="px-3 py-2">Lessons</th>
                        <th className="px-3 py-2">Created</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {courses.map((course) => (
                        <tr key={course._id} className="text-[13px] text-slate-700">
                          <td className="px-3 py-2 align-top">
                            <div className="max-w-xs truncate font-medium">{course.title}</div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                course.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {course.published ? "Published" : "Hidden"}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top text-xs">
                            {course.lessons ? course.lessons.length : 0}
                          </td>
                          <td className="px-3 py-2 align-top text-xs text-slate-500">
                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-3 py-2 align-top text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => router.push(`/admin/courses/${course._id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                disabled={coursesActionPending}
                                onClick={() => togglePublished(course._id, course.published)}
                              >
                                {course.published ? "Hide" : "Show"}
                              </Button>
                              <ConfirmDialog
                                title="Delete course"
                                description="This will permanently remove this course. This action cannot be undone."
                                destructive
                                confirmLabel={coursesActionPending ? "Deleting..." : "Delete"}
                                onConfirm={async () => {
                                  await deleteCourse(course._id);
                                }}
                                trigger={
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    disabled={coursesActionPending}
                                  >
                                    Delete
                                  </Button>
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ToastProvider>
  );
}
