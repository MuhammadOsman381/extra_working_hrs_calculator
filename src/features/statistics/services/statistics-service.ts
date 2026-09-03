import "server-only";

import { monthRange } from "@/src/lib/date";
import { prisma } from "@/src/lib/prisma";
import { calculateMonthlySummary, formatMinutes } from "@/src/features/work-days/calculations/time-calculations";

export async function getMonthlyStatistics(userId: string, month: string) {
  const { start, end } = monthRange(month);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { dailyWorkingHours: true },
  });
  const days = await prisma.workDay.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { breaks: true },
  });

  const totals = calculateMonthlySummary(days, user.dailyWorkingHours * 60);
  return {
    ...totals,
    working: formatMinutes(totals.workingMinutes),
    extra: formatMinutes(totals.extraMinutes),
    breakTime: formatMinutes(totals.breakMinutes),
  };
}
