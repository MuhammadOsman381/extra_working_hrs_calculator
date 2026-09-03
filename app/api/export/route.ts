import { NextRequest } from "next/server";
import { requireUser } from "@/src/features/auth/services/auth-service";
import { buildMonthlyWorkbook } from "@/src/features/export/services/export-service";
import { monthQuerySchema } from "@/src/features/work-days/schemas/work-day-schemas";
import { apiError } from "@/src/lib/api";
import { currentMonthValue } from "@/src/lib/date";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = monthQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month") ?? currentMonthValue(),
    });
    const workbook = await buildMonthlyWorkbook(user.id, parsed.month);
    return new Response(new Uint8Array(workbook), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="extra-hours-${parsed.month}.xlsx"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
