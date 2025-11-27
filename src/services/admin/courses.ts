import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, UserAdmin } from "@/types/admin";

export interface CourseAdmin {
  _id: string;
  title: string;
  description?: string;
  price: number;
  instructor?: Pick<UserAdmin, "_id" | "name" | "email" | "role"> | string;
  lessons?: Array<{
    _id: string;
    title: string;
    content?: string;
    videoUrl?: string;
    duration?: number;
  }>;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoursesQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  published?: boolean;
  priceType?: "free" | "paid";
  instructor?: string;
}

export async function getAdminCourses(params: CoursesQueryParams): Promise<PaginatedResponse<CourseAdmin>> {
  const res = await apiClient.get("/api/v1/admin/courses", {
    params: {
      page: params.page,
      limit: params.limit,
      q: params.q,
      published:
        typeof params.published === "boolean" ? String(params.published) : undefined,
      priceType: params.priceType,
      instructor: params.instructor,
    },
  });
  return res.data.data as PaginatedResponse<CourseAdmin>;
}

export async function getPartnerCourses(partnerId: string): Promise<CourseAdmin[]> {
  const res = await apiClient.get("/api/v1/admin/partners/" + partnerId + "/courses");
  return res.data.data as CourseAdmin[];
}

export async function getAdminCourse(courseId: string): Promise<CourseAdmin> {
  const res = await apiClient.get("/api/v1/admin/courses/" + courseId);
  return res.data.data as CourseAdmin;
}

export async function updateAdminCourse(courseId: string, payload: Partial<Pick<CourseAdmin, "title" | "description" | "price" | "published">>): Promise<CourseAdmin> {
  const res = await apiClient.patch("/api/v1/admin/courses/" + courseId, payload);
  return res.data.data as CourseAdmin;
}

export async function deleteAdminCourse(courseId: string): Promise<void> {
  await apiClient.delete("/api/v1/admin/courses/" + courseId);
}
