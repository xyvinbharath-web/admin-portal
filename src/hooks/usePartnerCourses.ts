"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPartnerCourses, updateAdminCourse, deleteAdminCourse, type CourseAdmin } from "@/services/admin/courses";
import { toastError, toastSuccess } from "@/lib/toast";

interface UsePartnerCoursesResult {
  courses: CourseAdmin[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  togglePublished: (courseId: string, currentPublished: boolean) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  actionPending: boolean;
}

export function usePartnerCourses(partnerId: string | undefined): UsePartnerCoursesResult {
  const queryClient = useQueryClient();

  const enabled = Boolean(partnerId);

  const { data, isLoading, isError, refetch } = useQuery<CourseAdmin[]>({
    queryKey: ["admin", "partner", "courses", partnerId],
    queryFn: () => getPartnerCourses(partnerId as string),
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseId, published }: { courseId: string; published: boolean }) =>
      updateAdminCourse(courseId, { published }),
    onSuccess: () => {
      toastSuccess("Course updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "partner", "courses", partnerId] });
    },
    onError: () => {
      toastError("Failed to update course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => deleteAdminCourse(courseId),
    onSuccess: () => {
      toastSuccess("Course deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "partner", "courses", partnerId] });
    },
    onError: () => {
      toastError("Failed to delete course");
    },
  });

  async function togglePublished(courseId: string, currentPublished: boolean) {
    await updateMutation.mutateAsync({ courseId, published: !currentPublished });
  }

  async function deleteCourse(courseId: string) {
    await deleteMutation.mutateAsync(courseId);
  }

  return {
    courses: data,
    isLoading,
    isError,
    refetch,
    togglePublished,
    deleteCourse,
    actionPending: updateMutation.isPending || deleteMutation.isPending,
  };
}
