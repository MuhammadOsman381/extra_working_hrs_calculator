import { apiError, apiSuccess } from "@/src/lib/api";
import { loginUser } from "@/src/features/auth/services/auth-service";

export async function POST(request: Request) {
  try {
    return apiSuccess(await loginUser(await request.json()));
  } catch (error) {
    return apiError(error);
  }
}
