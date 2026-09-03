import "server-only";

import { AppError } from "@/src/lib/api";
import { prisma } from "@/src/lib/prisma";

export async function startBreak(userId: string, workDayId: string) {
  const day = await prisma.workDay.findFirst({
    where: { id: workDayId, userId },
    include: { breaks: true },
  });
  if (!day) throw new AppError("NOT_FOUND", "Work day was not found.", 404);
  if (day.endTime) throw new AppError("ALREADY_COMPLETED", "Work day is already completed.");
  if (day.breaks.some((item) => !item.endTime)) {
    throw new AppError("ACTIVE_BREAK", "A break is already active.");
  }

  return prisma.break.create({
    data: { workDayId, startTime: new Date() },
    select: { id: true, startTime: true, endTime: true },
  });
}

export async function endBreak(userId: string, workDayId: string) {
  const day = await prisma.workDay.findFirst({
    where: { id: workDayId, userId },
    include: { breaks: { orderBy: { startTime: "desc" } } },
  });
  if (!day) throw new AppError("NOT_FOUND", "Work day was not found.", 404);
  const activeBreak = day.breaks.find((item) => !item.endTime);
  if (!activeBreak) throw new AppError("NO_ACTIVE_BREAK", "There is no active break to end.");

  return prisma.break.update({
    where: { id: activeBreak.id },
    data: { endTime: new Date() },
    select: { id: true, startTime: true, endTime: true },
  });
}
