"use client";

import { useCallback, useEffect, useState } from "react";
import { requestJson } from "@/src/lib/client-api";
import type { AppUser, MonthlyStatistics, WorkDayRecord } from "@/src/features/work-days/types";

export type SettingsUpdate = Pick<
  AppUser,
  | "dailyWorkingHours"
  | "theme"
  | "palette"
  | "countSaturdayAsExtraHours"
  | "countSaturdayAsDoubleExtraHours"
  | "countSundayAsExtraHours"
  | "countSundayAsDoubleExtraHours"
>;

type DashboardPayload = {
  days: WorkDayRecord[];
  today: WorkDayRecord | null;
};

export function useDashboardData(initialUser: AppUser) {
  const [user, setUser] = useState(initialUser);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState<WorkDayRecord[]>([]);
  const [today, setToday] = useState<WorkDayRecord | null>(null);
  const [stats, setStats] = useState<MonthlyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [records, statistics] = await Promise.all([
        requestJson<DashboardPayload>(`/api/work-days?month=${month}`),
        requestJson<MonthlyStatistics>(`/api/statistics?month=${month}`),
      ]);
      setDays(records.days);
      setToday(records.today);
      setStats(statistics);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function run(label: string, task: () => Promise<unknown>) {
    setMessage(null);
    try {
      await task();
      await refresh();
      setMessage(label);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function saveSettings(settings: SettingsUpdate) {
    const updated = await requestJson<AppUser>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
    setUser(updated);
    await refresh();
  }

  return {
    user,
    month,
    setMonth,
    days,
    today,
    stats,
    loading,
    message,
    setMessage,
    refresh,
    run,
    saveSettings,
  };
}
