import apiClient from "@/lib/apiClient";

export interface PartnerEarningsRecord {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  totalCourses: number;
  totalViews: number;
  totalPaidViews: number;
  totalEarnings: number;
}

export interface PaginatedPartnerEarnings {
  records: PartnerEarningsRecord[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

export interface PartnerEarningsQuery {
  page?: number;
  limit?: number;
  q?: string;
}

export async function getPartnerEarningsAnalytics(
  params: PartnerEarningsQuery
): Promise<PaginatedPartnerEarnings> {
  const res = await apiClient.get("/api/v1/admin/analytics/partners-earnings", {
    params,
  });
  return res.data.data as PaginatedPartnerEarnings;
}
