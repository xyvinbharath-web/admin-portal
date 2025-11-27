"use client";

import { useParams, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminCourse } from "@/hooks/useAdminCourse";
import { CourseDetailCard } from "@/components/admin/CourseDetailCard";

export default function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const { data: course, isLoading, isError, updateCourse, deleteCourse, updatePending, deletePending } =
    useAdminCourse(typeof id === "string" ? id : undefined);

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Course details</h1>
            <p className="text-xs text-slate-500">View and manage this course.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/courses")}>
              Back to courses
            </Button>
            {course && (
              <ConfirmDialog
                title="Delete course"
                description="This will permanently remove this course. This action cannot be undone."
                destructive
                confirmLabel={deletePending ? "Deleting..." : "Delete"}
                onConfirm={async () => {
                  await deleteCourse();
                  router.push("/admin/courses");
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
            <CardContent className="p-6 text-sm text-slate-500">Loading course...</CardContent>
          </Card>
        )}

        {isError && !isLoading && (
          <Card className="rounded-2xl border bg-white">
            <CardContent className="p-6 text-sm text-rose-500">
              Failed to load course. Try again later.
            </CardContent>
          </Card>
        )}

        {course && (
          <CourseDetailCard
            course={course}
            pending={updatePending}
            onSave={async (payload) => {
              await updateCourse(payload);
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
}
