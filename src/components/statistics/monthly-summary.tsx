"use client";

import { BriefcaseBusiness, CalendarCheck, Coffee, TimerReset } from "lucide-react";
import { StatisticsCard } from "./statistics-card";
import type { MonthlyStatistics } from "@/src/features/work-days/types";

export function MonthlySummary({ stats }: { stats: MonthlyStatistics | null }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatisticsCard title="Working Hours" value={stats?.working ?? "0h 0m"} caption="total this month" icon={<BriefcaseBusiness size={17} />} />
      <StatisticsCard title="Extra Hours" value={stats?.extra ?? "0h 0m"} caption="above target" icon={<TimerReset size={17} />} />
      <StatisticsCard title="Break Time" value={stats?.breakTime ?? "0h 0m"} caption="subtracted time" icon={<Coffee size={17} />} />
      <StatisticsCard title="Days Worked" value={stats?.daysWorked ?? 0} caption="completed workdays" icon={<CalendarCheck size={17} />} />
    </section>
  );
}
