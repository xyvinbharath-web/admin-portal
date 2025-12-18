import apiClient from "@/lib/apiClient";

interface UploadAvatarResponse {
  url: string;
}

export async function uploadAdminAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ success: boolean; message: string; data: UploadAvatarResponse }>(
    "/api/v1/uploads/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.data.url;
}
