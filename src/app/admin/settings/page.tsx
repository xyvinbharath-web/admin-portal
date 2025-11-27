"use client";

import { useState } from "react";
import { useAdminProfile, useAdminPasswordUpdate, useAdminPlatformSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const ENV_NAME = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development";

export default function SettingsPage() {
  const { data: profile } = useAdminProfile();
  const passwordMutation = useAdminPasswordUpdate();
  const { data: settings, updateSettings, updateSettingsState } = useAdminPlatformSettings();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [registrationEnabled, setRegistrationEnabled] = useState<boolean | undefined>(
    undefined
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | undefined>(undefined);

  const [inviteSignupPoints, setInviteSignupPoints] = useState<number | undefined>(undefined);
  const [inviteGoldPoints, setInviteGoldPoints] = useState<number | undefined>(undefined);
  const [pointsToCurrencyRate, setPointsToCurrencyRate] = useState<number | undefined>(undefined);
  const [minRedeemPoints, setMinRedeemPoints] = useState<number | undefined>(undefined);

  const effectiveRegistrationEnabled =
    registrationEnabled ?? settings?.registrationEnabled ?? true;
  const effectiveMaintenanceMessage =
    maintenanceMessage ?? settings?.maintenanceMessage ?? "";

  const effectiveInviteSignupPoints = inviteSignupPoints ?? settings?.inviteSignupPoints ?? 50;
  const effectiveInviteGoldPoints = inviteGoldPoints ?? settings?.inviteGoldPoints ?? 200;
  const effectivePointsToCurrencyRate =
    pointsToCurrencyRate ?? settings?.pointsToCurrencyRate ?? 10;
  const effectiveMinRedeemPoints = minRedeemPoints ?? settings?.minRedeemPoints ?? 500;

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword) return;
    await passwordMutation.mutateAsync({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    await updateSettings({
      registrationEnabled: effectiveRegistrationEnabled,
      maintenanceMessage: effectiveMaintenanceMessage,
      inviteSignupPoints: effectiveInviteSignupPoints,
      inviteGoldPoints: effectiveInviteGoldPoints,
      pointsToCurrencyRate: effectivePointsToCurrencyRate,
      minRedeemPoints: effectiveMinRedeemPoints,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-slate-500">
          Configure platform and admin account settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Admin profile */}
        <div className="space-y-3 rounded-lg border bg-white p-4 text-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Admin profile
          </div>
          {profile ? (
            <div className="space-y-1">
              <div>
                <div className="text-xs text-slate-500">Name</div>
                <div className="text-sm font-medium">{profile.name || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="text-sm">{profile.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Role</div>
                <div className="text-sm capitalize">{profile.role || "admin"}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading profile...</div>
          )}
        </div>

        {/* Change password */}
        <div className="space-y-3 rounded-lg border bg-white p-4 text-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Change password
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-500">Current password</div>
              <input
                type="password"
                className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-slate-500">New password</div>
              <input
                type="password"
                className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handlePasswordSubmit}
              disabled={passwordMutation.isPending || !currentPassword || !newPassword}
            >
              {passwordMutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </div>

        {/* Platform + Rewards settings */}
        <div className="space-y-3 rounded-lg border bg-white p-4 text-sm md:col-span-2 xl:col-span-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Platform settings
          </div>
          {settings ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={effectiveRegistrationEnabled}
                    onChange={(e) => setRegistrationEnabled(e.target.checked)}
                  />
                  <span>Allow new user registrations</span>
                </label>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Maintenance message</div>
                  <Textarea
                    rows={3}
                    value={effectiveMaintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Optional banner/message to show in the apps when maintenance is active."
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Rewards settings
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Invite signup points</div>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={effectiveInviteSignupPoints}
                      onChange={(e) =>
                        setInviteSignupPoints(Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Invite gold points</div>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={effectiveInviteGoldPoints}
                      onChange={(e) =>
                        setInviteGoldPoints(Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Points to currency rate</div>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={effectivePointsToCurrencyRate}
                      onChange={(e) =>
                        setPointsToCurrencyRate(
                          Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
                        )
                      }
                    />
                    <div className="text-[10px] text-slate-400">
                      e.g. 10 means 10 points = 1 unit
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Minimum redeem points</div>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      value={effectiveMinRedeemPoints}
                      onChange={(e) =>
                        setMinRedeemPoints(Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSettingsSave}
                  disabled={updateSettingsState.isPending}
                >
                  {updateSettingsState.isPending ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading settings...</div>
          )}
        </div>
      </div>

      {/* About section */}
      <div className="rounded-lg border bg-white p-4 text-sm">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          About
        </div>
        <div className="space-y-1">
          <div>
            <span className="text-xs text-slate-500">API base URL</span>
            <div className="text-sm font-mono text-slate-700">{API_BASE_URL}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Environment</span>
            <div className="text-sm text-slate-700 capitalize">{ENV_NAME}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
