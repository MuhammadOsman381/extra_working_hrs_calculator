import { redirect } from "next/navigation";
import { AuthForm } from "@/src/components/auth/auth-form";
import { getSession } from "@/src/features/auth/services/auth-service";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
