import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  dailyWorkingHours: z.coerce.number().min(1).max(24).default(8),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export const settingsSchema = z.object({
  dailyWorkingHours: z.coerce.number().min(1, "Daily hours must be greater than zero.").max(24),
});
