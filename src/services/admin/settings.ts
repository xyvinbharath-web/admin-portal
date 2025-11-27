import { apiClient } from "@/lib/apiClient";

export interface AdminProfile {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AdminSettings {
  registrationEnabled: boolean;
  maintenanceMessage: string;
  inviteSignupPoints: number;
  inviteGoldPoints: number;
  pointsToCurrencyRate: number;
  minRedeemPoints: number;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const res = await apiClient.get("/api/v1/admin/me");
  return res.data.data;
}

export async function updateAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.patch("/api/v1/admin/me/password", input);
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const res = await apiClient.get("/api/v1/admin/settings");
  return res.data.data;
}

export async function updateAdminSettings(input: AdminSettings): Promise<AdminSettings> {
  const res = await apiClient.put("/api/v1/admin/settings", input);
  return res.data.data;
}
