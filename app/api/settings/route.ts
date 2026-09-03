import { requireUser, updateSettings } from "@/src/features/auth/services/auth-service";
import { apiError, apiSuccess } from "@/src/lib/api";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    return apiSuccess(await updateSettings(user.id, await request.json()));
  } catch (error) {
    return apiError(error);
  }
}
