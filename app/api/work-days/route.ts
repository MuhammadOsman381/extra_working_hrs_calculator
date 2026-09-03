import { NextRequest } from "next/server";
import { requireUser } from "@/src/features/auth/services/auth-service";
import { apiError, apiSuccess } from "@/src/lib/api";
import { currentMonthValue } from "@/src/lib/date";
import { monthQuerySchema } from "@/src/features/work-days/schemas/work-day-schemas";
import { getTodayWorkDay, getWorkDays, startWorkDay, upsertManualWorkDay } from "@/src/features/work-days/services/work-day-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const month = request.nextUrl.searchParams.get("month");
    const parsed = monthQuerySchema.parse({ month: month ?? currentMonthValue() });
    const [days, today] = await Promise.all([
      getWorkDays(user.id, parsed.month),
      getTodayWorkDay(user.id),
    ]);
    return apiSuccess({ days, today });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const mode = request.nextUrl.searchParams.get("mode");
    const data = mode === "manual"
      ? await upsertManualWorkDay(user.id, await request.json())
      : await startWorkDay(user.id);
    return apiSuccess(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
