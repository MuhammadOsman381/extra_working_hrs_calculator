import { NextRequest } from "next/server";
import { requireUser } from "@/src/features/auth/services/auth-service";
import { getMonthlyStatistics } from "@/src/features/statistics/services/statistics-service";
import { monthQuerySchema } from "@/src/features/work-days/schemas/work-day-schemas";
import { apiError, apiSuccess } from "@/src/lib/api";
import { currentMonthValue } from "@/src/lib/date";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = monthQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month") ?? currentMonthValue(),
    });
    return apiSuccess(await getMonthlyStatistics(user.id, parsed.month));
  } catch (error) {
    return apiError(error);
  }
}
