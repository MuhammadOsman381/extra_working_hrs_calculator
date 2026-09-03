import { requireUser } from "@/src/features/auth/services/auth-service";
import { startBreak } from "@/src/features/breaks/services/break-service";
import { apiError, apiSuccess } from "@/src/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    return apiSuccess(await startBreak(user.id, id), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
