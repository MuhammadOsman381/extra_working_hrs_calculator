import { requireUser } from "@/src/features/auth/services/auth-service";
import { apiError, apiSuccess } from "@/src/lib/api";

export async function GET() {
  try {
    return apiSuccess(await requireUser());
  } catch (error) {
    return apiError(error);
  }
}
