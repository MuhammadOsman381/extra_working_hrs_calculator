export type BreakInterval = {
  startTime: Date | string;
  endTime?: Date | string | null;
};

export type DailySummary = {
  elapsedMinutes: number;
  breakMinutes: number;
  actualWorkingMinutes: number;
  extraMinutes: number;
};

export type ExtraHoursSettings = {
  countSaturdayAsExtraHours: boolean;
  countSaturdayAsDoubleExtraHours: boolean;
  countSundayAsExtraHours: boolean;
  countSundayAsDoubleExtraHours: boolean;
};

export const defaultExtraHoursSettings: ExtraHoursSettings = {
  countSaturdayAsExtraHours: false,
  countSaturdayAsDoubleExtraHours: false,
  countSundayAsExtraHours: false,
  countSundayAsDoubleExtraHours: false,
};

export function differenceInMinutes(startTime: Date | string, endTime: Date | string) {
  return Math.max(0, Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000));
}

export function calculateElapsedTime(startTime: Date | string, endTime?: Date | string | null) {
  if (!endTime) return 0;
  return differenceInMinutes(startTime, endTime);
}

export function calculateBreakTime(breaks: BreakInterval[]) {
  return breaks.reduce((total, item) => {
    if (!item.endTime) return total;
    return total + differenceInMinutes(item.startTime, item.endTime);
  }, 0);
}

export function calculateActualWorkingTime(
  startTime: Date | string,
  endTime: Date | string | null | undefined,
  breaks: BreakInterval[],
) {
  return Math.max(0, calculateElapsedTime(startTime, endTime) - calculateBreakTime(breaks));
}

export function calculateExtraHours(actualWorkingMinutes: number, normalWorkingMinutes: number) {
  return Math.max(actualWorkingMinutes - normalWorkingMinutes, 0);
}

function weekendExtraMultiplier(workDate: Date | string, settings: ExtraHoursSettings) {
  const day = new Date(workDate).getUTCDay();
  if (day === 6 && settings.countSaturdayAsExtraHours) {
    return settings.countSaturdayAsDoubleExtraHours ? 2 : 1;
  }
  if (day === 0 && settings.countSundayAsExtraHours) {
    return settings.countSundayAsDoubleExtraHours ? 2 : 1;
  }
  return 0;
}

export function calculateDailySummary(input: {
  workDate?: Date | string;
  startTime: Date | string;
  endTime?: Date | string | null;
  breaks: BreakInterval[];
  normalWorkingMinutes: number;
  extraHoursSettings?: Partial<ExtraHoursSettings>;
}): DailySummary {
  const elapsedMinutes = calculateElapsedTime(input.startTime, input.endTime);
  const breakMinutes = calculateBreakTime(input.breaks);
  const actualWorkingMinutes = Math.max(0, elapsedMinutes - breakMinutes);
  const extraHoursSettings = { ...defaultExtraHoursSettings, ...input.extraHoursSettings };
  const weekendMultiplier = weekendExtraMultiplier(input.workDate ?? input.startTime, extraHoursSettings);
  return {
    elapsedMinutes,
    breakMinutes,
    actualWorkingMinutes,
    extraMinutes: weekendMultiplier
      ? actualWorkingMinutes * weekendMultiplier
      : calculateExtraHours(actualWorkingMinutes, input.normalWorkingMinutes),
  };
}

export function calculateMonthlySummary(
  days: Array<{ date: Date | string; startTime: Date | string; endTime?: Date | string | null; breaks: BreakInterval[] }>,
  normalWorkingMinutes: number,
  extraHoursSettings: Partial<ExtraHoursSettings> = defaultExtraHoursSettings,
) {
  return days.reduce(
    (totals, day) => {
      if (!day.endTime) return totals;
      const summary = calculateDailySummary({
        ...day,
        workDate: day.date,
        normalWorkingMinutes,
        extraHoursSettings,
      });
      return {
        workingMinutes: totals.workingMinutes + summary.actualWorkingMinutes,
        extraMinutes: totals.extraMinutes + summary.extraMinutes,
        breakMinutes: totals.breakMinutes + summary.breakMinutes,
        daysWorked: totals.daysWorked + 1,
      };
    },
    { workingMinutes: 0, extraMinutes: 0, breakMinutes: 0, daysWorked: 0 },
  );
}

export function formatMinutes(minutes: number) {
  const normalized = Math.max(0, Math.round(minutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours}h ${mins}m`;
}
