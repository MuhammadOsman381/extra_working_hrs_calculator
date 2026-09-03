import "server-only";

import * as XLSX from "xlsx";
import { getMonthlyStatistics } from "@/src/features/statistics/services/statistics-service";
import { getWorkDays } from "@/src/features/work-days/services/work-day-service";

export async function buildMonthlyWorkbook(userId: string, month: string) {
  const [days, stats] = await Promise.all([
    getWorkDays(userId, month),
    getMonthlyStatistics(userId, month),
  ]);

  const details = days.map((day) => ({
    Date: day.date,
    "Start Time": new Date(day.startTime).toLocaleString(),
    "End Time": day.endTime ? new Date(day.endTime).toLocaleString() : "",
    "Elapsed Time": day.summary.elapsed,
    "Break Time": day.summary.breakTime,
    "Working Time": day.summary.actualWorking,
    "Extra Time": day.summary.extra,
    Breaks: day.breaks.length,
  }));

  const summary = [
    { Metric: "Total working hours", Value: stats.working },
    { Metric: "Total extra hours", Value: stats.extra },
    { Metric: "Total break time", Value: stats.breakTime },
    { Metric: "Days worked", Value: stats.daysWorked },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(details), "Daily records");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Monthly totals");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}
