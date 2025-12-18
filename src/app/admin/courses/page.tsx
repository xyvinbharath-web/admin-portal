"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { updateAdminCourse, deleteAdminCourse, type CourseAdmin } from "@/services/admin/courses";
import { useCreateAdminCourse } from "@/hooks/useCreateAdminCourse";
import { toastError, toastSuccess } from "@/lib/toast";

export default function CoursesPage() {
  const router = useRouter();
  const { data, isLoading, query, setQuery } = useAdminCourses({ page: 1, limit: 10 });
  const [search, setSearch] = useState(query.q ?? "");
  const [publishFilter, setPublishFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPriceType, setCreatePriceType] = useState<"free" | "paid">("free");
  const [createInstructor, setCreateInstructor] = useState("");
  const [createPublished, setCreatePublished] = useState(false);

  const createCourseMutation = useCreateAdminCourse();

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

  function handlePublishedChange(value: string) {
    setPublishFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      published: value === "" ? undefined : value === "true",
    }));
  }

  function handlePriceChange(value: string) {
    setPriceFilter(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      priceType: (value || undefined) as "free" | "paid" | undefined,
    }));
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
    if (!createTitle.trim()) return;

    try {
      const price = createPriceType === "free" ? 0 : 1;

      await createCourseMutation.mutateAsync({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        price,
        instructor: createInstructor.trim() || undefined,
        published: createPublished,
      });
      setCreateOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      setCreatePriceType("free");
      setCreateInstructor("");
      setCreatePublished(false);
      toastSuccess("Course created");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to create course");
    }
  }

  async function togglePublished(course: CourseAdmin) {
    try {
      setActionPendingId(course._id);
      await updateAdminCourse(course._id, { published: !course.published });
      toastSuccess("Course updated");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to update course");
    } finally {
      setActionPendingId(null);
    }
  }

  async function handleDelete(courseId: string) {
    try {
      setActionPendingId(courseId);
      await deleteAdminCourse(courseId);
      toastSuccess("Course deleted");
      setQuery((prev) => ({ ...prev }));
    } catch {
      toastError("Failed to delete course");
    } finally {
      setActionPendingId(null);
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Courses</h1>
            <p className="text-xs text-slate-500">Manage courses, modules, and enrollment.</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create course
          </Button>
        </div>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Search by course title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                className="h-9 rounded-md border bg-white px-2"
                value={publishFilter}
                onChange={(e) => handlePublishedChange(e.target.value)}
              >
                <option value="">All visibility</option>
                <option value="true">Published</option>
                <option value="false">Hidden</option>
              </select>
              <select
                className="h-9 rounded-md border bg-white px-2"
                value={priceFilter}
                onChange={(e) => handlePriceChange(e.target.value)}
              >
                <option value="">All pricing</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white">
          <CardContent className="p-0">
            {/* Mobile: cards */}
            <div className="space-y-2 p-3 text-xs md:hidden">
              {isLoading && (
                <div className="rounded-lg border bg-white p-3 text-slate-500">
                  Loading courses...
                </div>
              )}

              {!isLoading && (!data || data.records.length === 0) && (
                <div className="rounded-lg border bg-white p-3 text-slate-500">
                  No courses found. Try adjusting your search or filters.
                </div>
              )}

              {!isLoading &&
                data &&
                data.records.map((course) => (
                  <div
                    key={course._id}
                    className="rounded-xl border bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Course
                        </div>
                        <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                          {course.title}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600">
                          {typeof course.instructor === "string"
                            ? course.instructor
                            : course.instructor
                            ? `${course.instructor.name} (${course.instructor.email})`
                            : "-"}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          course.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.published ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Price
                        </div>
                        <div>
                          {course.price === 0 ? "Free" : `₹${course.price.toFixed(2)}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">
                          Lessons
                        </div>
                        <div>{course.lessons ? course.lessons.length : 0}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
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
                        disabled={actionPendingId === course._id}
                        onClick={() => togglePublished(course)}
                      >
                        {course.published ? "Hide" : "Publish"}
                      </Button>
                      <ConfirmDialog
                        title="Delete course"
                        description="This will permanently remove this course. This action cannot be undone."
                        destructive
                        confirmLabel={
                          actionPendingId === course._id ? "Deleting..." : "Delete"
                        }
                        onConfirm={async () => {
                          await handleDelete(course._id);
                        }}
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            disabled={actionPendingId === course._id}
                          >
                            Delete
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} courses
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
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Instructor</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Published</th>
                    <th className="px-3 py-2">Lessons</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading && (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={7}>
                        Loading courses...
                      </td>
                    </tr>
                  )}

                  {!isLoading && (!data || data.records.length === 0) && (
                    <tr>
                      <td className="px-3 py-6 text-center text-xs text-slate-500" colSpan={7}>
                        No courses found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    data &&
                    data.records.map((course) => (
                      <tr key={course._id} className="text-[13px] text-slate-700">
                        <td className="px-3 py-2 align-top">
                          <div className="max-w-xs truncate font-medium">{course.title}</div>
                        </td>
                        <td className="px-3 py-2 align-top text-xs">
                          {typeof course.instructor === "string"
                            ? course.instructor
                            : course.instructor
                            ? `${course.instructor.name} (${course.instructor.email})`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 align-top text-xs">
                          {course.price === 0 ? "Free" : `₹${course.price.toFixed(2)}`}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              course.published
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
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
                              disabled={actionPendingId === course._id}
                              onClick={() => togglePublished(course)}
                            >
                              {course.published ? "Hide" : "Show"}
                            </Button>
                            <ConfirmDialog
                              title="Delete course"
                              description="This will permanently remove this course. This action cannot be undone."
                              destructive
                              confirmLabel={actionPendingId === course._id ? "Deleting..." : "Delete"}
                              onConfirm={async () => {
                                await handleDelete(course._id);
                              }}
                              trigger={
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2 text-[11px]"
                                  disabled={actionPendingId === course._id}
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

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-slate-500">
                <div>
                  Page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} courses
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
          </CardContent>
        </Card>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
              <h2 className="text-sm font-semibold text-slate-900">Create course</h2>
              <p className="mb-4 mt-1 text-xs text-slate-500">
                Create a new course from the admin panel.
              </p>
              <form className="space-y-3" onSubmit={handleCreateSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Title</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Pricing</label>
                    <select
                      className="w-full rounded-md border px-3 py-2 text-xs"
                      value={createPriceType}
                      onChange={(e) => setCreatePriceType(e.target.value as "free" | "paid")}
                    >
                      <option value="free">Free course</option>
                      <option value="paid">Paid course (Gold members only)</option>
                    </select>
                    <p className="text-[10px] text-slate-400">
                      Free courses are open to everyone. Paid courses are available only for gold members.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Instructor ID (optional)</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={createInstructor}
                      onChange={(e) => setCreateInstructor(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400">MongoDB user ID of instructor. Can be set later.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="create-course-published"
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    checked={createPublished}
                    onChange={(e) => setCreatePublished(e.target.checked)}
                  />
                  <label
                    htmlFor="create-course-published"
                    className="text-xs font-medium text-slate-700"
                  >
                    Publish immediately
                  </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(false)}
                    disabled={createCourseMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createCourseMutation.isPending}>
                    {createCourseMutation.isPending ? "Creating..." : "Create"}
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
