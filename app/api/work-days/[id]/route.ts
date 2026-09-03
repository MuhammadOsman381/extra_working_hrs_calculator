import { requireUser } from "@/src/features/auth/services/auth-service";
import { apiError, apiSuccess } from "@/src/lib/api";
import { deleteWorkDay, endWorkDay, upsertManualWorkDay } from "@/src/features/work-days/services/work-day-service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const mode = new URL(request.url).searchParams.get("mode");
    const data = mode === "end"
      ? await endWorkDay(user.id, id)
      : await upsertManualWorkDay(user.id, await request.json(), id);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    return apiSuccess(await deleteWorkDay(user.id, id));
  } catch (error) {
    return apiError(error);
  }
}
