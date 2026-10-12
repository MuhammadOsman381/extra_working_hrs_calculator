import "server-only";

import { AppError } from "@/src/lib/api";
import { dateOnly, monthRange, todayDateOnly } from "@/src/lib/date";
import { prisma } from "@/src/lib/prisma";
import { calculateDailySummary, formatMinutes, type ExtraHoursSettings } from "../calculations/time-calculations";
import { manualWorkDaySchema } from "../schemas/work-day-schemas";

const workDayInclude = {
  breaks: { orderBy: { startTime: "asc" as const } },
};

type WorkDayWithBreaks = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  breaks: Array<{
    id: string;
    startTime: Date;
    endTime: Date | null;
  }>;
};

function serializeWorkDay(day: WorkDayWithBreaks, normalWorkingMinutes: number, extraHoursSettings: ExtraHoursSettings) {
  const summary = calculateDailySummary({
    workDate: day.date,
    startTime: day.startTime,
    endTime: day.endTime,
    breaks: day.breaks,
    normalWorkingMinutes,
    extraHoursSettings,
  });

  return {
    id: day.id,
    date: day.date.toISOString().slice(0, 10),
    startTime: day.startTime.toISOString(),
    endTime: day.endTime?.toISOString() ?? null,
    breaks: day.breaks.map((item) => ({
      id: item.id,
      startTime: item.startTime.toISOString(),
      endTime: item.endTime?.toISOString() ?? null,
    })),
    summary: {
      ...summary,
      elapsed: formatMinutes(summary.elapsedMinutes),
      breakTime: formatMinutes(summary.breakMinutes),
      actualWorking: formatMinutes(summary.actualWorkingMinutes),
      extra: formatMinutes(summary.extraMinutes),
    },
  };
}

async function getUserTimeSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyWorkingHours: true,
      countSaturdayAsExtraHours: true,
      countSaturdayAsDoubleExtraHours: true,
      countSundayAsExtraHours: true,
      countSundayAsDoubleExtraHours: true,
    },
  });
  return {
    normalWorkingMinutes: (user?.dailyWorkingHours ?? 8) * 60,
    extraHoursSettings: {
      countSaturdayAsExtraHours: user?.countSaturdayAsExtraHours ?? false,
      countSaturdayAsDoubleExtraHours: user?.countSaturdayAsDoubleExtraHours ?? false,
      countSundayAsExtraHours: user?.countSundayAsExtraHours ?? false,
      countSundayAsDoubleExtraHours: user?.countSundayAsDoubleExtraHours ?? false,
    },
  };
}

export async function getWorkDays(userId: string, month: string) {
  const { start, end } = monthRange(month);
  const { normalWorkingMinutes, extraHoursSettings } = await getUserTimeSettings(userId);
  const days = await prisma.workDay.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: workDayInclude,
    orderBy: { date: "desc" },
  });

  return days.map((day) => serializeWorkDay(day, normalWorkingMinutes, extraHoursSettings));
}

export async function getTodayWorkDay(userId: string) {
  const { normalWorkingMinutes, extraHoursSettings } = await getUserTimeSettings(userId);
  const day = await prisma.workDay.findUnique({
    where: { userId_date: { userId, date: todayDateOnly() } },
    include: workDayInclude,
  });
  return day ? serializeWorkDay(day, normalWorkingMinutes, extraHoursSettings) : null;
}

export async function startWorkDay(userId: string) {
  const existing = await prisma.workDay.findUnique({
    where: { userId_date: { userId, date: todayDateOnly() } },
  });
  if (existing) {
    throw new AppError("ALREADY_STARTED", "Work is already started for today.");
  }

  const day = await prisma.workDay.create({
    data: { userId, date: todayDateOnly(), startTime: new Date() },
    include: workDayInclude,
  });
  const { normalWorkingMinutes, extraHoursSettings } = await getUserTimeSettings(userId);
  return serializeWorkDay(day, normalWorkingMinutes, extraHoursSettings);
}

export async function endWorkDay(userId: string, id: string) {
  const day = await prisma.workDay.findFirst({ where: { id, userId }, include: workDayInclude });
  if (!day) throw new AppError("NOT_FOUND", "Work day was not found.", 404);
  if (day.endTime) throw new AppError("ALREADY_COMPLETED", "Work day is already completed.");
  if (day.breaks.some((item) => !item.endTime)) {
    throw new AppError("ACTIVE_BREAK", "End the active break before ending work.");
  }

  const updated = await prisma.workDay.update({
    where: { id },
    data: { endTime: new Date() },
    include: workDayInclude,
  });
  const { normalWorkingMinutes, extraHoursSettings } = await getUserTimeSettings(userId);
  return serializeWorkDay(updated, normalWorkingMinutes, extraHoursSettings);
}

export async function upsertManualWorkDay(userId: string, input: unknown, id?: string) {
  const data = manualWorkDaySchema.parse(input);
  const date = dateOnly(data.date);

  if (id) {
    const existing = await prisma.workDay.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("NOT_FOUND", "Work day was not found.", 404);
  } else {
    const duplicate = await prisma.workDay.findUnique({ where: { userId_date: { userId, date } } });
    if (duplicate) throw new AppError("ALREADY_STARTED", "A record already exists for this date.");
  }

  const saved = await prisma.$transaction(async (tx) => {
    const day = id
      ? await tx.workDay.update({
          where: { id },
          data: {
            date,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
          },
        })
      : await tx.workDay.create({
          data: {
            userId,
            date,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
          },
        });

    await tx.break.deleteMany({ where: { workDayId: day.id } });
    if (data.breaks.length) {
      await tx.break.createMany({
        data: data.breaks.map((item) => ({
          workDayId: day.id,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
        })),
      });
    }

    return tx.workDay.findUniqueOrThrow({ where: { id: day.id }, include: workDayInclude });
  });

  const { normalWorkingMinutes, extraHoursSettings } = await getUserTimeSettings(userId);
  return serializeWorkDay(saved, normalWorkingMinutes, extraHoursSettings);
}

export async function deleteWorkDay(userId: string, id: string) {
  const existing = await prisma.workDay.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError("NOT_FOUND", "Work day was not found.", 404);
  await prisma.workDay.delete({ where: { id } });
  return { id };
}
