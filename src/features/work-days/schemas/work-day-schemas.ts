import { z } from "zod";

const isoDateTime = z.string().datetime({ message: "Invalid date or time." });

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must use YYYY-MM format."),
});

export const manualWorkDaySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format."),
    startTime: isoDateTime,
    endTime: isoDateTime.optional().nullable(),
    breaks: z
      .array(
        z
          .object({
            id: z.string().optional(),
            startTime: isoDateTime,
            endTime: isoDateTime,
          })
          .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
            message: "Break end time must be after start time.",
          }),
      )
      .default([]),
  })
  .refine((value) => !value.endTime || new Date(value.endTime) > new Date(value.startTime), {
    message: "End time must be after start time.",
  });
