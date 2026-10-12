"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/src/components/dashboard/dashboard-header";
import { ExcelExportButton } from "@/src/components/dashboard/excel-export-button";
import { MonthSelector } from "@/src/components/dashboard/month-selector";
import { AddWorkDayModal } from "@/src/components/modals/add-work-day-modal";
import { EditWorkDayModal } from "@/src/components/modals/edit-work-day-modal";
import { SettingsModal } from "@/src/components/modals/settings-modal";
import { WorkDayTable } from "@/src/components/records/work-day-table";
import { MonthlySummary } from "@/src/components/statistics/monthly-summary";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Toast } from "@/src/components/ui/toast";
import { WorkControls } from "@/src/components/work-tracker/work-controls";
import { useDashboardData } from "@/src/hooks/use-dashboard-data";
import { useTheme } from "@/src/components/theme/theme-provider";
import { requestJson } from "@/src/lib/client-api";
import { Plus } from "lucide-react";
import type { AppUser, WorkDayRecord } from "@/src/features/work-days/types";

function monthTitle(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex - 1, 1),
  );
}

export function DashboardClient({ user: initialUser }: { user: AppUser }) {
  const dashboard = useDashboardData(initialUser);
  const { syncFromUser } = useTheme();
  const [editing, setEditing] = useState<WorkDayRecord | null>(null);
  const [adding, setAdding] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    syncFromUser(dashboard.user.theme, dashboard.user.palette);
  }, [dashboard.user.palette, dashboard.user.theme, syncFromUser]);
  const extraHoursSettings = {
    countSaturdayAsExtraHours: dashboard.user.countSaturdayAsExtraHours,
    countSaturdayAsDoubleExtraHours: dashboard.user.countSaturdayAsDoubleExtraHours,
    countSundayAsExtraHours: dashboard.user.countSundayAsExtraHours,
    countSundayAsDoubleExtraHours: dashboard.user.countSundayAsDoubleExtraHours,
  };

  return (
    <div className="admin-surface min-h-screen text-[var(--foreground)]">
      <DashboardHeader user={dashboard.user} onOpenSettings={() => setSettingsOpen(true)} />
      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:gap-6">
        <WorkControls
          today={dashboard.today}
          normalWorkingHours={dashboard.user.dailyWorkingHours}
          extraHoursSettings={extraHoursSettings}
          run={dashboard.run}
        />

        <MonthlySummary stats={dashboard.stats} />

        <Card as="section" className="grid gap-8 p-4 sm:gap-9 sm:p-5" interactive={false}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--subtle)]">Work History</p>
              <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{monthTitle(dashboard.month)}</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MonthSelector month={dashboard.month} onChange={dashboard.setMonth} />
              <Button variant="accent" className="h-11 px-4" icon={<Plus size={20} strokeWidth={1.8} />} onClick={() => setAdding(true)}>
                Add Record
              </Button>
              <ExcelExportButton month={dashboard.month} />
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <WorkDayTable
              days={dashboard.days}
              loading={dashboard.loading}
              onEdit={setEditing}
              onAdd={() => setAdding(true)}
              onStartWork={() =>
                void dashboard.run("Work started.", () => requestJson("/api/work-days", { method: "POST" }))
              }
              onDeleted={dashboard.refresh}
            />
          </div>
        </Card>
      </main>

      <AddWorkDayModal
        open={adding}
        normalWorkingHours={dashboard.user.dailyWorkingHours}
        extraHoursSettings={extraHoursSettings}
        onClose={() => setAdding(false)}
        onSaved={dashboard.refresh}
      />
      <EditWorkDayModal
        record={editing}
        normalWorkingHours={dashboard.user.dailyWorkingHours}
        extraHoursSettings={extraHoursSettings}
        onClose={() => setEditing(null)}
        onSaved={dashboard.refresh}
      />
      <SettingsModal
        open={settingsOpen}
        user={dashboard.user}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={dashboard.saveSettings}
      />
      <Toast message={dashboard.message} />
    </div>
  );
}
