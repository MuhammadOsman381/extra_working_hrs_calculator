export type BreakRecord = {
  id: string;
  startTime: string;
  endTime: string | null;
};

export type WorkDayRecord = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  breaks: BreakRecord[];
  summary: {
    elapsedMinutes: number;
    breakMinutes: number;
    actualWorkingMinutes: number;
    extraMinutes: number;
    elapsed: string;
    breakTime: string;
    actualWorking: string;
    extra: string;
  };
};

export type MonthlyStatistics = {
  workingMinutes: number;
  extraMinutes: number;
  breakMinutes: number;
  daysWorked: number;
  working: string;
  extra: string;
  breakTime: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  dailyWorkingHours: number;
  theme: import("@/src/lib/palettes").ThemeMode;
  palette: import("@/src/lib/palettes").PaletteId;
  countSaturdayAsExtraHours: boolean;
  countSaturdayAsDoubleExtraHours: boolean;
  countSundayAsExtraHours: boolean;
  countSundayAsDoubleExtraHours: boolean;
};
