"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminCourse, type CreateAdminCoursePayload, type CourseAdmin } from "@/services/admin/courses";

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation<CourseAdmin, unknown, CreateAdminCoursePayload>({
    mutationFn: (payload) => createAdminCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
  });
}
