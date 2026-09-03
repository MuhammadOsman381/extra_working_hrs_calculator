import { apiError, apiSuccess } from "@/src/lib/api";
import { registerUser } from "@/src/features/auth/services/auth-service";

export async function POST(request: Request) {
  try {
    return apiSuccess(await registerUser(await request.json()), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
