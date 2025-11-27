"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCourse, updateAdminCourse, deleteAdminCourse, type CourseAdmin } from "@/services/admin/courses";
import { toastError, toastSuccess } from "@/lib/toast";

interface UseAdminCourseResult {
  data: CourseAdmin | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  updateCourse: (payload: Partial<Pick<CourseAdmin, "title" | "description" | "price" | "published">>) => Promise<void>;
  deleteCourse: () => Promise<void>;
  updatePending: boolean;
  deletePending: boolean;
}

export function useAdminCourse(id: string | undefined): UseAdminCourseResult {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseAdmin | undefined>({
    queryKey: ["admin", "course", id],
    queryFn: () => (id ? getAdminCourse(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Pick<CourseAdmin, "title" | "description" | "price" | "published">>) => {
      if (!id) throw new Error("Missing course id");
      return updateAdminCourse(id, payload);
    },
    onSuccess: () => {
      toastSuccess("Course updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "course", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: () => {
      toastError("Failed to update course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing course id");
      await deleteAdminCourse(id);
    },
    onSuccess: () => {
      toastSuccess("Course deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: () => {
      toastError("Failed to delete course");
    },
  });

  async function updateCourse(payload: Partial<Pick<CourseAdmin, "title" | "description" | "price" | "published">>) {
    await updateMutation.mutateAsync(payload);
  }

  async function deleteCourse() {
    await deleteMutation.mutateAsync();
  }

  return {
    data,
    isLoading,
    isError,
    refetch,
    updateCourse,
    deleteCourse,
    updatePending: updateMutation.isPending,
    deletePending: deleteMutation.isPending,
  };
}
