import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdminProfile,
  AdminSettings,
  getAdminProfile,
  getAdminSettings,
  updateAdminPassword,
  updateAdminSettings,
} from "@/services/admin/settings";
import { toastError, toastSuccess } from "@/lib/toast";

export function useAdminProfile() {
  const { data, isLoading, isError, error, refetch } = useQuery<AdminProfile>({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
  });

  return { data, isLoading, isError, error, refetch };
}

export function useAdminPasswordUpdate() {
  const mutation = useMutation({
    mutationFn: updateAdminPassword,
    onSuccess: () => {
      toastSuccess("Password updated");
    },
    onError: () => {
      toastError("Failed to update password");
    },
  });

  return mutation;
}

export function useAdminPlatformSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<AdminSettings>({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettings,
  });

  const mutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      toastSuccess("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => {
      toastError("Failed to update settings");
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings: mutation.mutateAsync,
    updateSettingsState: mutation,
  };
}
