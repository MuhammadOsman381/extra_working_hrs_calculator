import { clearSession } from "@/src/features/auth/services/auth-service";
import { apiError, apiSuccess } from "@/src/lib/api";

export async function POST() {
  try {
    await clearSession();
    return apiSuccess({ loggedOut: true });
  } catch (error) {
    return apiError(error);
  }
}
